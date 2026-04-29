import Stripe from "stripe";

import { purchaseCredits as purchaseCreditsInStore } from "@/lib/store";

export async function purchaseCredits(userId: string, credits: number) {
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: `${credits} yoga credits`
            },
            unit_amount: credits * 100
          }
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/credits?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/credits?purchase=cancelled`
    });

    return {
      mode: "stripe" as const,
      checkoutUrl: session.url
    };
  }

  const wallet = purchaseCreditsInStore(userId, credits);

  return {
    mode: "demo" as const,
    wallet
  };
}
