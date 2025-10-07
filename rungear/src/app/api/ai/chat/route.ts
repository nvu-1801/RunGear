import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SALES_SYSTEM_PROMPT, renderPrompt } from "../prompts/sales-system";

export const runtime = "nodejs";

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
];

export async function POST(req: NextRequest) {
  try {
    const { prompt, history } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response("Missing 'prompt'", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return new Response("Server missing GEMINI_API_KEY", { status: 500 });

    // Tạo client (nếu SDK của bạn hỗ trợ object, dùng { apiKey }).
    const genAI =
      // @google/generative-ai các bản cũ dùng ctor dạng string:
      new GoogleGenerativeAI(apiKey);

    // Lịch sử → contents
    const histContents =
      Array.isArray(history)
        ? history
            .filter((m: any) => m && typeof m.text === "string" && (m.role === "user" || m.role === "assistant"))
            .map((m: any) => ({
              role: m.role === "user" ? "user" : "model",
              parts: [{ text: m.text as string }],
            }))
        : [];

    // Render biến trong prompt (vd: STORE_NAME lấy từ ENV)
    const systemPrompt = renderPrompt(SALES_SYSTEM_PROMPT, {
      STORE_NAME: process.env.STORE_NAME ?? "Run Gear",
    });

    const tryModelsInOrder = async () => {
      let lastErr: any = null;
      for (const modelId of MODEL_CANDIDATES) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelId,
            systemInstruction: systemPrompt, // ✅ đặt system ở init
          });
          const result = await model.generateContentStream({
            contents: [...histContents, { role: "user", parts: [{ text: prompt }] }],
          });
          return { modelId, stream: result.stream };
        } catch (e: any) {
          const msg = e?.message || String(e);
          if (msg.includes("404") || msg.includes("not found") || msg.includes("is not supported")) {
            lastErr = e;
            continue;
          }
          throw e;
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
    return new Response(e?.message || String(e), { status: 500 });
  }
}
