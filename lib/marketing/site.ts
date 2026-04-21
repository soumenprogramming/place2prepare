export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const SITE_NAME = "Place2Prepare";
export const SITE_TAGLINE =
  "Placement preparation for engineering students — DSA, system design, aptitude, and live mock interviews.";

/** Default social preview (SVG; replace with a 1200×630 PNG for broadest crawler support). */
export const SITE_OG_IMAGE = "/og-default.svg";

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
