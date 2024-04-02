import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_CLIENT,
});

export async function POST(request) {
    const { id, amount } = await request.json();
    let parameter = {
        item_details: [
            {
                price: amount,
                quantity: 1,
                name: "Top Up",
            },
        ],
        transaction_details: {
            order_id: id,
            gross_amount: amount,
        },
    };

    let token = await snap.createTransactionToken(parameter);

    return NextResponse.json({ token });
}
