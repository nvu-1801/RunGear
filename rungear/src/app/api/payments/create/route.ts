import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const { orderCode, amount, description } = body; 

  const clientId = process.env.PAYOS_CLIENT_ID!;
  const apiKey = process.env.PAYOS_API_KEY!;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY!;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  const returnUrl = `${baseUrl}/payments/return`;
  const cancelUrl = `${baseUrl}/payments/cancel`;

  // Tạo chữ ký
  const raw = `${orderCode}|${amount}|${description}|${returnUrl}|${cancelUrl}`;
  const signature = crypto.createHmac("sha256", checksumKey).update(raw).digest("hex");

  // Gọi PayOS API
  const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
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
  });

  const data = await res.json();
  return NextResponse.json(data);
}
