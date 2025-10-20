import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    // Type guard for body
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const bodyObj = body as Record<string, unknown>;
    const orderCode =
      typeof bodyObj.orderCode === "number" ? bodyObj.orderCode : Date.now();

    // ✅ Ép số tiền test = 2000 tại server (không tin client)
    const amount = 2000;

    const clientId = process.env.PAYOS_CLIENT_ID!;
    const apiKey = process.env.PAYOS_API_KEY!;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY!;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!; // https://rungear.vercel.app

    const description =
      typeof bodyObj.description === "string" && bodyObj.description.length
        ? bodyObj.description
        : `Thanh toán đơn hàng #${orderCode}`;

    const returnUrl = `${baseUrl}/payments/return`;
    const cancelUrl = `${baseUrl}/payments/cancel`;

    // ✅ ĐÚNG FORMAT KÝ: amount&cancelUrl&description&orderCode&returnUrl (sort theo alphabet key)
    const raw =
      `amount=${amount}` +
      `&cancelUrl=${cancelUrl}` +
      `&description=${description}` +
      `&orderCode=${orderCode}` +
      `&returnUrl=${returnUrl}`;

    const signature = crypto
      .createHmac("sha256", checksumKey)
      .update(raw)
      .digest("hex");

    const res = await fetch(
      "https://api-merchant.payos.vn/v2/payment-requests",
      {
        method: "POST",
        headers: {
          "x-client-id": clientId,
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderCode,
          amount,
          description,
          returnUrl,
          cancelUrl,
          signature,
        }),
      }
    );

    const data: unknown = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "internal_error";
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
