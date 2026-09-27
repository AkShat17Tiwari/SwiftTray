import { describe, expect, it } from "vitest";
import { moneyToPaise, paiseToMoney } from "../convex/lib/money";

describe("money conversion", () => {
  it("converts rupees without floating-point drift", () => {
    expect(moneyToPaise(199.99)).toBe(19_999);
    expect(paiseToMoney(19_999)).toBe(199.99);
  });

  it("allows a free customization option", () => {
    expect(moneyToPaise(0)).toBe(0);
  });

  it("rejects invalid monetary values", () => {
    expect(() => moneyToPaise(-0.01)).toThrow();
    expect(() => moneyToPaise(Number.NaN)).toThrow();
    expect(() => paiseToMoney(10.5)).toThrow();
  });
});
