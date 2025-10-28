import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { orderCode, amount, description } = body as {
      orderCode?: unknown;
      amount?: unknown;
      description?: unknown;
    };

    // Validate inputs
    if (!orderCode || !Number.isFinite(Number(orderCode))) {
      return NextResponse.json(
        { error: "Invalid orderCode" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const orderCodeNum = Number(orderCode);

    // ✅ Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_code, status, user_id")
      .eq("user_id", user.id)
      .eq("order_code", orderCodeNum)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return NextResponse.json(
        { error: "Order not found or does not belong to you" },
        { status: 404 }
      );
    }

    // Check PayOS credentials
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!clientId || !apiKey || !checksumKey || !baseUrl) {
      console.error("Missing PayOS credentials or base URL");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    console.log("=== Payment Creation Debug ===");
    console.log("Base URL:", baseUrl);
    console.log("Order Code:", orderCodeNum);
    console.log("Amount:", amount);
    console.log("User:", user.id);

    const desc =
      typeof description === "string" && description.length
        ? description
        : `Thanh toán đơn hàng #${orderCodeNum}`;

    const returnUrl = `${baseUrl}/payments/return?orderCode=${orderCodeNum}`;
    const cancelUrl = `${baseUrl}/payments/cancel?orderCode=${orderCodeNum}`;

    console.log("Return URL:", returnUrl);
    console.log("Cancel URL:", cancelUrl);

    // Build signature
    const raw =
      `amount=${amount}` +
      `&cancelUrl=${cancelUrl}` +
      `&description=${desc}` +
      `&orderCode=${orderCodeNum}` +
      `&returnUrl=${returnUrl}`;

    const signature = crypto
      .createHmac("sha256", checksumKey)
      .update(raw)
      .digest("hex");

    const paymentPayload = {
      orderCode: orderCodeNum,
      amount,
      description: desc,
      returnUrl,
      cancelUrl,
      signature,
    };

    console.log("Payment Payload:", JSON.stringify(paymentPayload, null, 2));

    // Call PayOS API
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

    // ✅ Update order with payment_link_id and set status to PROCESSING
    if (
      data &&
      typeof data === "object" &&
      "data" in data &&
      data.data &&
      typeof data.data === "object" &&
      "paymentLinkId" in data.data
    ) {
      const paymentLinkId = (data.data as { paymentLinkId?: unknown })
        .paymentLinkId;

      if (typeof paymentLinkId === "string") {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_link_id: paymentLinkId,
            status: "PROCESSING",
          })
          .eq("user_id", user.id)
          .eq("order_code", orderCodeNum);

        if (updateError) {
          console.error("Failed to update order with payment_link_id:", updateError);
        } else {
          console.log(`✅ Order #${orderCodeNum} updated with payment_link_id: ${paymentLinkId}`);
        }
      }
    }

    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "internal_error";
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}