import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", receipt } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Fetch live exchange rate
    let exchangeRate = 90; // Fallback default
    try {
      const rateRes = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      if (rateRes.ok) {
        const data = await rateRes.json();
        if (data?.rates?.INR) {
          exchangeRate = data.rates.INR;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live exchange rate, using fallback:", err);
    }

    const amountInINR = Math.round(amount * exchangeRate);

    const options = {
      amount: amountInINR * 100, // Amount in paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
