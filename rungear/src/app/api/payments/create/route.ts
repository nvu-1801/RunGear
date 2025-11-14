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

    // ✅ Step 1: Get orderCode string (with "ORD" prefix)
    let orderCodeString: string;
    
    if (typeof bodyObj.orderCode === "string" && bodyObj.orderCode.length > 0) {
      orderCodeString = bodyObj.orderCode;
      console.log("✅ Using orderCode from request (string):", orderCodeString);
    } else {
      orderCodeString = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      console.warn("⚠️ No valid orderCode provided, generated new:", orderCodeString);
    }

    // ✅ Step 2: Strip "ORD" prefix để gửi PayOS (PayOS chỉ nhận number)
    const orderCodeForPayOS = orderCodeString.replace(/^ORD/, "");
    const orderCodeNumber = parseInt(orderCodeForPayOS, 10);

    // ✅ Step 3: Validate number constraints
    if (isNaN(orderCodeNumber) || orderCodeNumber <= 0) {
      console.error("❌ Invalid orderCode number:", orderCodeNumber);
      return NextResponse.json(
        { error: "Invalid orderCode format" },
        { status: 400 }
      );
    }

    if (orderCodeNumber > 9007199254740991) {
      console.error("❌ OrderCode exceeds max safe integer:", orderCodeNumber);
      return NextResponse.json(
        { error: "OrderCode too large" },
        { status: 400 }
      );
    }

    console.log("📋 Order Code Mapping:");
    console.log("  Database format:", orderCodeString);     // "ORD1763111042442307"
    console.log("  PayOS format:", orderCodeNumber);        // 1763111042442307

    const amount =
      typeof bodyObj.amount === "number" && bodyObj.amount > 0
        ? bodyObj.amount
        : 2000;

    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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

    console.log("\n=== Payment Creation Debug ===");
    console.log("Base URL:", baseUrl);
    console.log("Order Code (DB):", orderCodeString);
    console.log("Order Code (PayOS):", orderCodeNumber);
    console.log("Amount:", amount);

    const description =
      typeof bodyObj.description === "string" && bodyObj.description.length
        ? bodyObj.description
        : `Thanh toán đơn hàng #${orderCodeString}`;

    // ✅ Use orderCodeString in URLs (for tracking)
    const returnUrl = `${baseUrl}/payments/return?orderCode=${orderCodeString}`;
    const cancelUrl = `${baseUrl}/payments/cancel?orderCode=${orderCodeString}`;

    console.log("Return URL:", returnUrl);
    console.log("Cancel URL:", cancelUrl);

    // ✅ FIX: Build signature với orderCodeNumber (không có prefix)
    const raw =
      `amount=${amount}` +
      `&cancelUrl=${cancelUrl}` +
      `&description=${description}` +
      `&orderCode=${orderCodeNumber}` +  // ← Use NUMBER here
      `&returnUrl=${returnUrl}`;

    console.log("Signature raw data:", raw);

    const signature = crypto
      .createHmac("sha256", checksumKey)
      .update(raw)
      .digest("hex");

    // ✅ FIX: Send orderCodeNumber (number) to PayOS
    const paymentPayload = {
      orderCode: orderCodeNumber,  // ← NUMBER, không có "ORD"
      amount,
      description,
      returnUrl,
      cancelUrl,
      signature,
    };

    console.log("\n📤 Payment Payload:");
    console.log(JSON.stringify(paymentPayload, null, 2));

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
    console.log("\n📥 PayOS Response:");
    console.log(JSON.stringify(data, null, 2));

    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "internal_error";
    console.error("\n❌ Payment creation error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
