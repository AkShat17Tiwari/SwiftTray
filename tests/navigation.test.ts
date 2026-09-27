import { describe, expect, it } from "vitest";
import { safeDestination } from "../src/lib/navigation";

describe("post-auth navigation", () => {
  it("allows local application paths", () => {
    expect(safeDestination("/checkout?step=2")).toBe("/checkout?step=2");
  });

  it.each([null, "https://evil.example", "//evil.example", "javascript:alert(1)"])(
    "rejects unsafe destination %s",
    (destination) => expect(safeDestination(destination)).toBe("/dashboard")
  );
});
