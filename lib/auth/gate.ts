import { createHmac, timingSafeEqual } from "crypto";

export const GATE_COOKIE = "gate";

function sign(secret: string): string {
  return createHmac("sha256", secret).update("ok").digest("hex");
}

export function createGateCookieValue(): string {
  const secret = process.env.APP_GATE_SECRET;
  if (!secret) throw new Error("APP_GATE_SECRET não configurado.");
  return sign(secret);
}

export function isGateCookieValid(value: string | undefined | null): boolean {
  if (!value) return false;
  let expected: string;
  try {
    expected = createGateCookieValue();
  } catch {
    return false;
  }
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
