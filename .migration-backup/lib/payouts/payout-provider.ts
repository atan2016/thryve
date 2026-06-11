export type PayoutProviderPayload = {
  teacherId: string;
  amountCredits: number;
  payoutReference: string;
};

export type PayoutProviderResult = {
  provider: "manual" | "stripe-connect";
  status: "pending" | "scheduled" | "paid" | "failed";
  externalId?: string;
};

export async function schedulePayout(payload: PayoutProviderPayload): Promise<PayoutProviderResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      provider: "manual",
      status: "scheduled",
      externalId: payload.payoutReference
    };
  }

  return {
    provider: "stripe-connect",
    status: "scheduled",
    externalId: `future-${payload.payoutReference}`
  };
}
