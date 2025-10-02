// app/api/ai/chat/route.ts
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// Ưu tiên 2.5 Flash, có fallback hợp lệ khác
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || "gemini-2.5-flash",
  "gemini-2.5-pro",        // nếu cần suy luận nặng
  "gemini-1.5-flash",      // fallback đời 1.5 vẫn chạy v1
];

export async function POST(req: NextRequest) {
  try {
    const { prompt, history } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response("Missing 'prompt'", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[AI] Missing GEMINI_API_KEY");
      return new Response("Server missing GEMINI_API_KEY", { status: 500 });
    }

    // Ép dùng API v1 (SDK mới gọi là Google Gen AI SDK)
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); 

    // Chuẩn hóa lịch sử thành contents
    const histContents: Array<{ role: "user" | "model"; parts: { text: string }[] }> =
      Array.isArray(history)
        ? history
            .filter((m: any) => m && typeof m.text === "string" && (m.role === "user" || m.role === "assistant"))
            .map((m: any) => ({
              role: m.role === "user" ? "user" : "model",
              parts: [{ text: m.text as string }],
            }))
        : [];

    const systemPrompt =
      "Bạn là Run Gear AI. Trả lời bằng tiếng Việt, ngắn gọn, hữu ích, thân thiện.";

    // Thử lần lượt các model hợp lệ
    const tryModelsInOrder = async () => {
      let lastErr: any = null;

      for (const modelId of MODEL_CANDIDATES) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelId,
            systemInstruction: systemPrompt, // đặt system đúng chỗ
          });

          // Streaming — SDK v1
          const result = await model.generateContentStream({
            contents: [...histContents, { role: "user", parts: [{ text: prompt }] }],
          });

          return { modelId, stream: result.stream };
        } catch (e: any) {
          const msg = e?.message || String(e);
          // Model không hỗ trợ/v1 404 → thử model tiếp theo
          if (msg.includes("404") || msg.includes("not found") || msg.includes("is not supported")) {
            lastErr = e;
            continue;
          }
          throw e; // lỗi khác (quota/auth/…)
        }
      }
      throw lastErr ?? new Error("No available Gemini model");
    };

    const { modelId, stream } = await tryModelsInOrder();

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const part = chunk.text();
            if (part) controller.enqueue(encoder.encode(part));
          }
        } catch (err: any) {
          controller.enqueue(encoder.encode(`\n[AI error] ${err?.message || String(err)}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Model-Used": modelId,
      },
    });
  } catch (e: any) {
    console.error("[AI route fatal]:", e?.message || String(e));
    return new Response(e?.message || String(e), { status: 500 });
  }
}
