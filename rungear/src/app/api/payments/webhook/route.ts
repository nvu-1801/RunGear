import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/libs/supabase/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper: convert order_code to safe format for comparison
function normalizeOrderCode(v: unknown): string | null {
  if (typeof v === "number") return v.toString();
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  return null;
}

// Build signature data from payload (sorted keys)
function buildSignatureData(obj: Record<string, unknown>): string {
  const keys = Object.keys(obj).sort();
  return keys
    .map((k) => {
      let v = obj[k];
      if (v === null || v === undefined) v = "";
      else if (typeof v === "object") v = JSON.stringify(v);
      return `${k}=${v}`;
    })
    .join("&");
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Webhook endpoint is alive" });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("\n🔔 ===== WEBHOOK RECEIVED =====");

  try {
    // 1. Parse payload
    const payload: unknown = await req.json();
    console.log("📦 Raw payload:", JSON.stringify(payload, null, 2));

    // Type guard
    if (
      !payload ||
      typeof payload !== "object" ||
      !("data" in payload) ||
      !("signature" in payload)
    ) {
      console.error("❌ Invalid payload structure");
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

    // 2. Verify signature
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    if (!checksumKey) {
      console.error("❌ PAYOS_CHECKSUM_KEY not configured");
      return NextResponse.json(
        { ok: false, reason: "server misconfigured" },
        { status: 500 }
      );
    }

    const raw = buildSignatureData(data);
    const expectedSignature = crypto
      .createHmac("sha256", checksumKey)
      .update(raw)
      .digest("hex");

    console.log("🔐 Signature verification:");
    console.log("   Raw data:", raw);
    console.log("   Expected:", expectedSignature);
    console.log("   Received:", signature);

    if (signature !== expectedSignature) {
      console.error("❌ SIGNATURE MISMATCH - Possible tampering!");
      return NextResponse.json(
        { ok: false, reason: "invalid signature" },
        { status: 401 }
      );
    }

    console.log("✅ Signature verified");

    // 3. Extract data from webhook
    const {
      orderCode,
      amount,
      paymentLinkId,
      status,
      transactionDateTime,
    } = data;

    const orderCodeStr = normalizeOrderCode(orderCode);
    if (!orderCodeStr) {
      console.error("❌ Invalid orderCode:", orderCode);
      return NextResponse.json(
        { ok: false, reason: "invalid orderCode" },
        { status: 400 }
      );
    }
    console.log(`📌 Normalized orderCode: "${orderCodeStr}" (type: ${typeof orderCode})`);

    // Determine payment success
    const isSuccess = status === "PAID" || code === "00";
    const orderStatus = isSuccess ? "PAID" : "FAILED";

    console.log(`\n📋 Order Details:`);
    console.log(`   Order Code: ${orderCodeStr}`);
    console.log(`   Amount: ${amount}`);
    console.log(`   Status: ${orderStatus}`);
    console.log(`   Payment Link ID: ${paymentLinkId}`);
    console.log(`   Transaction Time: ${transactionDateTime}`);

    // 4. Initialize Supabase admin client (bypass RLS)
    const admin = supabaseAdmin();

    // 5. Find order by order_code
    console.log(`\n🔍 Finding order with code: ${orderCodeStr}`);
    let { data: existingOrder, error: findError } = await admin
      .from("orders")
      .select("id, order_code, status, discount_code_id, user_id")
      .eq("order_code", orderCodeStr)
      .maybeSingle();

      // Try 2: If not found, try with "ORD" prefix
    if (!existingOrder && !findError) {
      const withPrefix = `ORD${orderCodeStr}`;
      console.log(`   🔍 Trying with prefix: "${withPrefix}"`);
      
      const result = await admin
        .from("orders")
        .select("id, order_code, status, discount_code_id, user_id")
        .eq("order_code", withPrefix)
        .maybeSingle();
      
      existingOrder = result.data;
      findError = result.error;
    }

    if (findError) {
      console.error("❌ Database error:", findError);
      return NextResponse.json(
        { ok: false, reason: "database_error", error: findError.message },
        { status: 500 }
      );
    }

    if (!existingOrder) {
      console.error("❌ Order not found for code:", orderCodeStr);
      
      // DEBUG: Show recent orders
      const { data: recentOrders } = await admin
        .from("orders")
        .select("order_code, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      console.error("\n📋 Recent orders in DB:");
      recentOrders?.forEach(o => {
        console.error(`   - ${o.order_code} (${o.status}) [${o.created_at}]`);
      });
      
      return NextResponse.json(
        { 
          ok: false, 
          reason: "order_not_found",
          searchedCodes: [orderCodeStr, `ORD${orderCodeStr}`],
        },
        { status: 404 }
      );
    }

    console.log(`✅ Order found: ID=${existingOrder.id}, Code=${existingOrder.order_code}, Status=${existingOrder.status}`);
    
    // 6. Idempotent check - don't update if already PAID
    if (existingOrder.status === "PAID") {
      console.log("⚠️  Order already marked as PAID - skipping update (idempotent)");
      return NextResponse.json({
        ok: true,
        orderCode: orderCodeStr,
        status: "PAID",
        message: "already processed",
      });
    }

    // 7. Update order status
    console.log(`\n📝 Updating order status to: ${orderStatus}`);
    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: orderStatus,
        paid_at: isSuccess ? new Date().toISOString() : null,
        payment_link_id: typeof paymentLinkId === "string" ? paymentLinkId : null,
      })
      .eq("id", existingOrder.id);

    if (updateError) {
      console.error("❌ Failed to update order:", updateError);
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      );
    }

    console.log("✅ Order status updated successfully");

    // 8. Increment discount code usage (only if payment successful)
    if (isSuccess && existingOrder.discount_code_id) {
      console.log(`\n🎟️  Processing discount code: ${existingOrder.discount_code_id}`);

      const { data: discountCode, error: dcSelectError } = await admin
        .from("discount_codes")
        .select("uses_count, code")
        .eq("id", existingOrder.discount_code_id)
        .single();

      if (dcSelectError) {
        console.error("⚠️  Failed to read discount code:", dcSelectError.message);
      } else {
        const currentUses =
          typeof discountCode?.uses_count === "number"
            ? discountCode.uses_count
            : 0;
        const newCount = currentUses + 1;

        console.log(`   Code: ${discountCode.code}`);
        console.log(`   Uses: ${currentUses} → ${newCount}`);

        const { error: dcUpdateError } = await admin
          .from("discount_codes")
          .update({ uses_count: newCount })
          .eq("id", existingOrder.discount_code_id);

        if (dcUpdateError) {
          console.error("⚠️  Failed to increment discount usage:", dcUpdateError.message);
        } else {
          console.log("✅ Discount code usage incremented");
        }
      }
    }

    // 9. Optional: Clear user's cart after successful payment
    if (isSuccess) {
      console.log(`\n🛒 Clearing cart for user: ${existingOrder.user_id}`);
      // Implement cart clearing logic here if needed
      // Example:
      // await admin.from("cart_items").delete().eq("user_id", existingOrder.user_id);
    }

    const processingTime = Date.now() - startTime;
    console.log(`\n✅ ===== WEBHOOK PROCESSED (${processingTime}ms) =====\n`);

    // 10. Return success response to PayOS
    return NextResponse.json(
      {
        ok: true,
        orderCode: orderCodeStr,
        status: orderStatus,
        processingTime: `${processingTime}ms`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "internal_error";
    console.error("❌ Webhook error:", err);
    console.error("Stack:", err instanceof Error ? err.stack : "");

    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}