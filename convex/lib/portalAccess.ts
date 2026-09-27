const SIX_DIGIT_CODE = /^\d{6}$/;

export const PORTAL_ACCESS_DURATION_MS = 8 * 60 * 60 * 1_000;
export const PORTAL_LOCK_DURATION_MS = 15 * 60 * 1_000;
export const MAX_PORTAL_ATTEMPTS = 5;

export function isSixDigitCode(value: string): boolean {
  return SIX_DIGIT_CODE.test(value);
}

export function generateSixDigitCode(): string {
  const range = 1_000_000;
  const limit = Math.floor(0x1_0000_0000 / range) * range;
  const values = new Uint32Array(1);
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return (values[0] % range).toString().padStart(6, "0");
}

export function portalCodePepper(): string {
  const pepper = process.env.PORTAL_CODE_PEPPER;
  if (!pepper || pepper.length < 32) {
    throw new Error("PORTAL_CODE_PEPPER must be configured with at least 32 characters.");
  }
  return pepper;
}

export async function hashPortalCode(input: {
  code: string;
  userId: string;
  pepper: string;
}): Promise<string> {
  const bytes = new TextEncoder().encode(
    `${input.pepper}:${input.userId}:${input.code}`
  );
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export function secureHashEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}
