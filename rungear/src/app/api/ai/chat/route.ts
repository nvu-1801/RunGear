// app/api/assistant/route.ts
import { NextRequest, NextResponse } from "next/server";
import { genAI, MODEL, toolset } from "@/lib/gemini";
import {
  searchProductsTool,
  getProductDetailsTool,
} from "@/lib/tools/products";
import { createClient } from "@supabase/supabase-js";
import type { Tool, Part, FunctionResponsePart } from "@google/generative-ai";
import { getCategoriesForPrompt } from "@/lib/tools/categories"; // ← IMPORT

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
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("[AI] Missing GEMINI_API_KEY env");
      return NextResponse.json(
        { error: "Server misconfigured: missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const body: unknown = await req.json();
    // ← LOG RAW BODY
    console.log("\n📥 Raw Request Body:");
    console.log(JSON.stringify(body, null, 2));

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

    // ← LOAD CATEGORIES ĐỘNG
    const categoriesText = await getCategoriesForPrompt();

    // Khởi tạo model với toolset (function calling)
    const model = genAI.getGenerativeModel({
      model: MODEL,
      // Cast toolset to Tool type - ensure toolset is properly typed in @/lib/gemini
      tools: [toolset as Tool],
      systemInstruction: `
Bạn là chatbot tư vấn sản phẩm thể thao cho cửa hàng Run Gear.

**DANH MỤC SẢN PHẨM:**
${categoriesText}

**HƯỚNG DẪN QUAN TRỌNG:**
1. Khi người dùng hỏi về sản phẩm, LUÔN gọi tool searchProducts
2. Truyền categoryId bằng SLUG (ví dụ: "ao", "giay", "quan")
3. KHÔNG dùng tiếng Anh như "shirts", "shoes", "pants"
4. Ví dụ đúng:
   - "Tìm áo" → searchProducts({ categoryId: "ao" })
   - "Giày chạy" → searchProducts({ q: "giày chạy", categoryId: "giay" })
   - "Quần size M" → searchProducts({ q: "quần", categoryId: "quan" })

5. Luôn hỏi rõ: ngân sách, size, mục đích sử dụng
6. Hiển thị tối đa 3 sản phẩm: tên, giá, link, lý do gợi ý
7. Nếu cần chi tiết → Gọi getProductDetails(id)
8. Trả lời ngắn gọn, tiếng Việt tự nhiên

**CHÚ Ý:**
- Dùng slug tiếng Việt không dấu: "ao", "giay", "quan"
- KHÔNG dùng: "shirts", "shoes", "pants"
      `,
    });

    // ===== 1) Gọi lần đầu
    console.log("\n🚀 ===== CALLING GEMINI API =====");
    console.log("Prompt:", prompt);
    console.log("History length:", histContents.length);

    let res = await model.generateContent({
      contents: [...histContents, { role: "user", parts: [{ text: prompt }] }],
    });

    let response = res.response;
    let functionCalls = response.functionCalls();

    console.log("\n📤 ===== GEMINI RESPONSE =====");
    console.log("Has function calls:", functionCalls ? "YES" : "NO");

    if (functionCalls && functionCalls.length > 0) {
      console.log("Function calls count:", functionCalls.length);
      functionCalls.forEach((call, idx) => {
        console.log(`\n  [${idx + 1}] Function: ${call.name}`);
        console.log(`      Args:`, JSON.stringify(call.args, null, 2));
      });
    } else {
      console.log("Direct text response (no function call)");
      console.log("Response preview:", response.text().substring(0, 200));
    }

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
