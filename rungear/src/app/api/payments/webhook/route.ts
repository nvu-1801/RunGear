// app/api/payments/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const payload = await req.json();

  // Ví dụ payload bạn đưa:
  // { code:"00", success:true, data:{ orderCode, amount, paymentLinkId, status? ... }, signature:"..." }

  const checksumKey = process.env.PAYOS_CHECKSUM_KEY!;

  // 1) Tự build rawData theo QUY ĐỊNH của PayOS để verify
  // Thường là nối các field trong data theo thứ tự tài liệu quy định.
  // Ví dụ minh họa (bạn cần đối chiếu docs PayOS):
  const d = payload.data || {};
  const raw = `${d.orderCode}|${d.amount}|${d.paymentLinkId}|${payload.code}`;
  const expectedSig = crypto.createHmac("sha256", checksumKey).update(raw).digest("hex");

  if (payload.signature !== expectedSig) {
    // chữ ký sai => bỏ qua
    return NextResponse.json({ ok: false, reason: "invalid signature" }, { status: 400 });
  }

  // 2) Tìm đơn trong DB
  // const order = await db.orders.findUnique({ where: { order_code: d.orderCode } });
  // if (!order) return NextResponse.json({ ok:false, reason:"order not found" }, { status: 404 });

  // 3) Đối soát amount
  // if (order.amount !== d.amount) { ... log cảnh báo, có thể FAIL }

  // 4) Cập nhật trạng thái theo status/query:
  // Map status PayOS -> order_status
  // 'PAID' -> 'PAID', 'CANCELLED' -> 'CANCELLED', ...
  // await db.orders.update({ where: { id: order.id }, data: { status: 'PAID', paid_at: new Date(), payment_link_id: d.paymentLinkId } });

  return NextResponse.json({ ok: true });
}
