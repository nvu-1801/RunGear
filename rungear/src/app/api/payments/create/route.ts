import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    console.log(JSON.stringify(body, null, 2));

    // Type guard for body
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const bodyObj = body as Record<string, unknown>;
    let orderCode: number;

    if (typeof bodyObj.orderCode === "string" && bodyObj.orderCode.trim() !== "") {
      // Loại bỏ prefix "ORD" nếu có
      const cleaned = bodyObj.orderCode.replace(/^ORD/i, "");
      orderCode = parseInt(cleaned, 10);

      if (isNaN(orderCode)) {
        orderCode = Date.now(); // Fallback nếu parse fail
      }

      console.log("📌 Converted orderCode: '{}' → {}", bodyObj.orderCode, orderCode);
    } else if (typeof bodyObj.orderCode === "number") {
      orderCode = bodyObj.orderCode;
    } else {
      orderCode = Date.now();
    }

    const amount =
      typeof bodyObj.amount === "number" && bodyObj.amount > 0
        ? bodyObj.amount
        : 2000;

    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // ✅ Add validation and logging
    if (!clientId || !apiKey || !checksumKey) {
      console.error("Missing PayOS credentials");
      return NextResponse.json(
        { error: "Server misconfigured: missing PayOS credentials" },
        { status: 500 }
      );
    }

    if (!baseUrl) {
      console.error("Missing NEXT_PUBLIC_BASE_URL");
      return NextResponse.json(
        { error: "Server misconfigured: missing base URL" },
        { status: 500 }
      );
    }

    // ✅ Log để debug
    console.log("=== Payment Creation Debug ===");
    console.log("Base URL:", baseUrl);
    console.log("Order Code:", orderCode);
    console.log("Amount:", amount);

    const description =
      typeof bodyObj.description === "string" && bodyObj.description.length
        ? bodyObj.description
        : `Thanh toán đơn hàng #${orderCode}`;

    const returnUrl = `${baseUrl}/payments/return?orderCode=${orderCode}`;
    const cancelUrl = `${baseUrl}/payments/cancel?orderCode=${orderCode}`;

    console.log("Return URL:", returnUrl);
    console.log("Cancel URL:", cancelUrl);

    // ✅ ĐÚNG FORMAT KÝ: amount&cancelUrl&description&orderCode&returnUrl
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

    const paymentPayload = {
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
      signature,
    };

    console.log("Payment Payload:", JSON.stringify(paymentPayload, null, 2));

    const res = await fetch(
      "https://api-merchant.payos.vn/v2/payment-requests",
      {
        method: "POST",
        headers: {
          "x-client-id": clientId,
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      }
    );

    const data: unknown = await res.json();
    console.log("PayOS Response:", data);

    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "internal_error";
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
