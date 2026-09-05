const REQUIRED_PRODUCTION_SETTINGS = [
  "LEGAL_NAME",
  "LEGAL_ADDRESS",
  "LEGAL_REGISTRATION",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "STRIPE_WEBHOOK_SECRET",
] as const;

/** Prevents taking money before identity, withdrawal confirmation and lifecycle alerts work. */
export function missingCommerceSettings(
  env: Record<string, string | undefined>,
  production: boolean
): string[] {
  if (!production) return [];
  return REQUIRED_PRODUCTION_SETTINGS.filter((key) => !env[key]?.trim());
}
