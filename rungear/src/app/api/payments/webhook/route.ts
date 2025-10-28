// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper: convert order_code to safe number for bigint comparison
function asOrderCodeNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    const n = Number(v.trim());
    if (n > Number.MAX_SAFE_INTEGER || n < Number.MIN_SAFE_INTEGER) {
      console.warn("order_code exceeds safe integer range:", n);
      return null;
    }
    return n;
  }
  return null;
}

function buildSignatureData(obj: Record<string, unknown>): string {
  const keys = Object.keys(obj).sort();
  return keys
    .map((k) => {
      let v = obj[k];
      if (v === null || v === undefined || v === "null" || v === "undefined")
        v = "";
      else if (typeof v === "object") v = JSON.stringify(v);
      return `${k}=${v}`;
    })
    .join("&");
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Webhook is alive" });
}

export async function POST(req: NextRequest) {
  try {
    const payload: unknown = await req.json();

    // Type guard for payload
    if (
      !payload ||
      typeof payload !== "object" ||
      !("data" in payload) ||
      !("signature" in payload)
    ) {
      console.error("❌ Webhook: missing data/signature");
      return NextResponse.json(
        { ok: false, reason: "missing data/signature" },
        { status: 400 }
      );
    }

    const { data, signature, code } = payload as {
      data: Record<string, unknown>;
      signature: string;
      code?: string;
    };

    if (!data || !signature) {
      console.error("❌ Webhook: empty data or signature");
      return NextResponse.json(
        { ok: false, reason: "missing data/signature" },
        { status: 400 }
      );
    }

    // Verify signature
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    if (!checksumKey) {
      console.error("❌ Webhook: PAYOS_CHECKSUM_KEY not configured");
      return NextResponse.json(
        { ok: false, reason: "server misconfigured" },
        { status: 500 }
      );
    }

    const raw = buildSignatureData(data);
    const expected = crypto
      .createHmac("sha256", checksumKey)
      .update(raw)
      .digest("hex");

    if (signature !== expected) {
      console.error("❌ Invalid webhook signature");
      console.error("Expected:", expected);
      console.error("Received:", signature);
      return NextResponse.json(
        { ok: false, reason: "invalid signature" },
        { status: 401 }
      );
    }

    console.log("✅ Webhook signature verified");

    // Extract order data
    const { orderCode, amount, paymentLinkId, status } = data;

    // Convert orderCode to safe number for bigint comparison
    const codeNum = asOrderCodeNumber(orderCode);
    if (codeNum === null) {
      console.error("❌ Invalid orderCode:", orderCode);
      return NextResponse.json(
        { ok: false, reason: "invalid orderCode" },
        { status: 400 }
      );
    }

    // Determine success status
    // PayOS uses 'status' === "PAID" or 'code' === "00"
    const success = status === "PAID" || code === "00";
    const orderStatus = success ? "PAID" : "FAILED";

    console.log(
      `📦 Processing order #${codeNum}: status=${orderStatus}, amount=${amount}`
    );

    // Update database with idempotent protection
    const supabase = await supabaseServer();
    const { error } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        paid_at: success ? new Date().toISOString() : null,
        payment_link_id:
          typeof paymentLinkId === "string" ? paymentLinkId : null,
      })
      .eq("order_code", codeNum) // ✅ bigint comparison with number
      .neq("status", "PAID"); // ✅ idempotent: don't overwrite already paid orders

    if (error) {
      console.error("❌ Database update error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(
      `✅ Order #${codeNum} updated to ${orderStatus} (amount=${amount})`
    );

    // Return success response to PayOS
    return NextResponse.json({
      ok: true,
      orderCode: codeNum,
      status: orderStatus,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "internal_error";
    console.error("❌ Webhook error:", err);
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}
