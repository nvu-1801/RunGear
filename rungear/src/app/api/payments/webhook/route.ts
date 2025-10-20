// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      return NextResponse.json(
        { ok: false, reason: "missing data/signature" },
        { status: 400 }
      );
    }

    const checksumKey = process.env.PAYOS_CHECKSUM_KEY!;
    // ✅ PayOS yêu cầu ký trên OBJECT data, sort key alphabet, "key=value&..."
    const raw = buildSignatureData(data);
    const expected = crypto
      .createHmac("sha256", checksumKey)
      .update(raw)
      .digest("hex");

    if (signature !== expected) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json(
        { ok: false, reason: "invalid signature" },
        { status: 400 }
      );
    }

    // --- Hợp lệ: đối soát và cập nhật DB ---
    const { orderCode, amount, paymentLinkId, status } = data;
    const supabase = await supabaseServer();

    // Map trạng thái
    // Ưu tiên 'status' từ data; fallback 'code' === "00"
    const success = status === "PAID" || code === "00";
    const orderStatus = success ? "PAID" : "FAILED";

    const { error } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        paid_at: success ? new Date().toISOString() : null,
        payment_link_id:
          typeof paymentLinkId === "string" ? paymentLinkId : null,
        // OPTIONAL: lưu amount bạn nhận được để log/đối soát
        // paid_amount: typeof amount === "number" ? amount : 0
      })
      .eq("order_code", String(orderCode));

    if (error) {
      console.error("❌ Update order error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(
      `✅ Order ${orderCode} updated to ${orderStatus} (amount=${amount})`
    );
    // Webhook chỉ cần trả 200/JSON. KHÔNG redirect ở đây (PayOS không mở trình duyệt người dùng).
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "internal_error";
    console.error("❌ Webhook error:", err);
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}
