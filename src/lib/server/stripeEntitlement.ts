export interface StripeChargeState {
  status?: string;
  paid?: boolean;
  disputed?: boolean;
  refunded?: boolean;
  amount?: number;
  amount_refunded?: number;
}

/** Eenmalige toegang blijft alleen geldig zolang de charge echt betaald is. */
export function chargeAllowsEntitlement(
  paymentIntentStatus: string | undefined,
  charge: StripeChargeState | null
): boolean {
  if (paymentIntentStatus !== "succeeded" || !charge) return false;
  const fullyRefunded = Boolean(
    charge.refunded ||
      (typeof charge.amount === "number" &&
        charge.amount > 0 &&
        typeof charge.amount_refunded === "number" &&
        charge.amount_refunded >= charge.amount)
  );
  return (
    charge.status === "succeeded" &&
    charge.paid === true &&
    charge.disputed !== true &&
    !fullyRefunded
  );
}
