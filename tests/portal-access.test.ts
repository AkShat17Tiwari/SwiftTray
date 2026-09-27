import { describe, expect, it } from "vitest";
import {
  generateSixDigitCode,
  hashPortalCode,
  isSixDigitCode,
  secureHashEqual,
} from "../convex/lib/portalAccess";

describe("portal access codes", () => {
  it("generates fixed-width numeric codes", () => {
    for (let index = 0; index < 100; index += 1) {
      expect(generateSixDigitCode()).toMatch(/^\d{6}$/);
    }
  });

  it("rejects malformed codes", () => {
    expect(isSixDigitCode("654321")).toBe(true);
    expect(isSixDigitCode("12345")).toBe(false);
    expect(isSixDigitCode("1234567")).toBe(false);
    expect(isSixDigitCode("12a456")).toBe(false);
  });

  it("binds hashes to both the user and the server pepper", async () => {
    const base = await hashPortalCode({
      code: "654321",
      userId: "user-a",
      pepper: "a-secure-test-pepper-with-32-characters",
    });
    const same = await hashPortalCode({
      code: "654321",
      userId: "user-a",
      pepper: "a-secure-test-pepper-with-32-characters",
    });
    const otherUser = await hashPortalCode({
      code: "654321",
      userId: "user-b",
      pepper: "a-secure-test-pepper-with-32-characters",
    });

    expect(secureHashEqual(base, same)).toBe(true);
    expect(secureHashEqual(base, otherUser)).toBe(false);
  });
});
