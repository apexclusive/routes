export const PRODUCTION_ORIGIN = "https://routes.apexclusive.nl";

/**
 * Return-URL origin for payment providers. Production never falls back to a
 * request Host header: a malformed setting must still return to the real site.
 */
export function trustedReturnOrigin(
  configured: string | undefined,
  requestOrigin: string,
  production: boolean
): string {
  const fallback = production ? PRODUCTION_ORIGIN : requestOrigin;
  try {
    const url = new URL(configured || fallback);
    const localDevelopment =
      !production &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      url.protocol === "http:";
    return url.protocol === "https:" || localDevelopment ? url.origin : fallback;
  } catch {
    return fallback;
  }
}
