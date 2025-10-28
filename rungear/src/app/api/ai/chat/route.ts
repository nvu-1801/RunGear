// app/api/assistant/route.ts
import { NextRequest, NextResponse } from "next/server";
import { genAI, MODEL, toolset } from "@/lib/gemini";
import {
  searchProductsTool,
  getProductDetailsTool,
} from "@/lib/tools/products";
import { createClient } from "@supabase/supabase-js";
import type { Tool, Part, FunctionResponsePart } from "@google/generative-ai";

export const runtime = "nodejs";

function getMessage(err: unknown) {
  if (typeof err === "object" && err !== null && "message" in err) {
    try {
      return String((err as { message?: unknown }).message ?? String(err));
    } catch {
      return String(err);
    }
  }
  return String(err);
}

export async function POST(req: NextRequest) {
  try {
    // quick env check
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
      console.error("[AI] Missing GOOGLE_API_KEY env");
      return NextResponse.json(
        { error: "Server misconfigured: missing GOOGLE_API_KEY" },
        { status: 500 }
      );
    }

    const body: unknown = await req.json();

    // Type guard for request body
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { prompt, history, sessionId, userId } = body as {
      prompt?: unknown;
      history?: unknown;
      sessionId?: unknown;
      userId?: unknown;
    };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing 'prompt'" }, { status: 400 });
    }

    // --- Optional: Supabase admin for chat logs (best-effort) ---
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbSrvKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // optional
    const supabaseAdmin =
      sbUrl && sbSrvKey ? createClient(sbUrl, sbSrvKey) : null;

    // log user message (fire-and-forget)
    if (supabaseAdmin) {
      (async () => {
        try {
          await supabaseAdmin.from("ai_chat_logs").insert({
            session_id: sessionId ?? null,
            role: "user",
            text: prompt,
            user_id: userId ?? null,
            meta: { source: "chat_api" },
          });
        } catch (err) {
          console.error("ai_chat_logs insert user error:", getMessage(err));
        }
      })();
    }

    // Map history -> Gemini contents
    const histContents = Array.isArray(history)
      ? history
          .filter((m: unknown) => {
            if (typeof m !== "object" || m === null) return false;
            const mm = m as { text?: unknown; role?: unknown };
            return (
              typeof mm.text === "string" &&
              (mm.role === "user" || mm.role === "assistant")
            );
          })
          .map((m: unknown) => {
            const mm = m as { text: string; role: string };
            return {
              role: mm.role === "user" ? ("user" as const) : ("model" as const),
              parts: [{ text: mm.text }],
            };
          })
      : [];

    // Khởi tạo model với toolset (function calling)
    const model = genAI.getGenerativeModel({
      model: MODEL,
      // Cast toolset to Tool type - ensure toolset is properly typed in @/lib/gemini
      tools: [toolset as Tool],
      systemInstruction: `
Bạn là chatbot tư vấn sản phẩm thể thao (áo, quần, giày) cho cửa hàng.
- Luôn hỏi rõ ngân sách, mục đích dùng, size/giới tính nếu cần.
- Khi gợi ý, ưu tiên gọi tool "searchProducts" để lấy dữ liệu thật.
- Trả lời ngắn gọn, tiếng Việt tự nhiên.
- Hiển thị tối đa 3 sản phẩm: tên, giá, còn hàng/không, link, và 1 lý do ngắn.
- Nếu người dùng muốn chi tiết 1 sản phẩm, hãy gọi tool "getProductDetails".
- Không bịa thông tin ngoài dữ liệu tool trả về.
      `,
    });

    // ===== 1) Gọi lần đầu
    let res = await model.generateContent({
      contents: [...histContents, { role: "user", parts: [{ text: prompt }] }],
    });

    let response = res.response;
    let functionCalls = response.functionCalls();

    // Giữ history cục bộ để tiếp tục đối thoại
    const historyForTurn = [
      ...histContents,
      { role: "user" as const, parts: [{ text: prompt }] },
    ];

    // ===== 2) Nếu có functionCalls: thực thi tool & phản hồi lại cho model
    while (functionCalls && functionCalls.length > 0) {
      // Properly typed function response parts
      const toolParts: FunctionResponsePart[] = [];

      for (const call of functionCalls) {
        const name = call.name;
        const args = call.args as Record<string, unknown>;

        let result: unknown;
        try {
          if (name === "searchProducts") {
            result = await searchProductsTool(args);
          } else if (name === "getProductDetails") {
            result = await getProductDetailsTool(args);
          } else {
            result = { error: `Unknown tool: ${name}` };
          }
        } catch (err: unknown) {
          result = { error: getMessage(err) };
        }

        // Push properly typed FunctionResponsePart
        toolParts.push({
          functionResponse: {
            name,
            response: result as object, // Cast to object as required by SDK
          },
        });
      }

      // Gửi functionResponse để model suy luận tiếp
      res = await model.generateContent({
        contents: [
          ...historyForTurn,
          { role: "function" as const, parts: toolParts },
        ],
      });
      response = res.response;
      functionCalls = response.functionCalls();
    }

    const text = response.text();

    // log assistant (best-effort)
    if (supabaseAdmin) {
      (async () => {
        try {
          await supabaseAdmin.from("ai_chat_logs").insert({
            session_id: sessionId ?? null,
            role: "assistant",
            text,
            user_id: userId ?? null,
            meta: { model: MODEL },
          });
        } catch (err) {
          console.error(
            "ai_chat_logs insert assistant error:",
            getMessage(err)
          );
        }
      })();
    }

    return NextResponse.json({ text, model: MODEL });
  } catch (e: unknown) {
    console.error("[AI] POST error:", e);
    return NextResponse.json({ error: "AI server error" }, { status: 500 });
  }
}
