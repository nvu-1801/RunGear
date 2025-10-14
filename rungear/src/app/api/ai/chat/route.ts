import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SALES_SYSTEM_PROMPT, renderPrompt } from "../prompts/sales-system";

export const runtime = "nodejs";

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
];

// helper to safely extract message from unknown errors
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
    const { prompt, history } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response("Missing 'prompt'", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return new Response("Server missing GEMINI_API_KEY", { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);

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
              role: mm.role === "user" ? "user" : "model",
              parts: [{ text: mm.text }],
            };
          })
      : [];

    const systemPrompt = renderPrompt(SALES_SYSTEM_PROMPT, {
      STORE_NAME: process.env.STORE_NAME ?? "Run Gear",
    });

    const tryModelsInOrder = async () => {
      let lastErr: unknown = null;
      for (const modelId of MODEL_CANDIDATES) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelId,
            systemInstruction: systemPrompt,
          });
          const result = await model.generateContentStream({
            contents: [
              ...histContents,
              { role: "user", parts: [{ text: prompt }] },
            ],
          });
          return { modelId, stream: result.stream };
        } catch (e: unknown) {
          const msg = getMessage(e);
          if (
            msg.includes("404") ||
            msg.includes("not found") ||
            msg.includes("is not supported")
          ) {
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
            const part = (chunk as unknown as { text?: () => string }).text?.();
            if (part) controller.enqueue(encoder.encode(part));
          }
        } catch (err: unknown) {
          controller.enqueue(encoder.encode(`\n[AI error] ${getMessage(err)}`));
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
  } catch (e: unknown) {
    return new Response(getMessage(e), { status: 500 });
  }
}
