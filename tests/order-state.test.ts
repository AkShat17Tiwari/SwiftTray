import { describe, expect, it } from "vitest";
import { canTransitionOrder, type OrderStatus } from "../convex/lib/orderState";

describe("order lifecycle", () => {
  it("allows only forward kitchen transitions", () => {
    expect(canTransitionOrder("placed", "accepted")).toBe(true);
    expect(canTransitionOrder("accepted", "preparing")).toBe(true);
    expect(canTransitionOrder("preparing", "ready")).toBe(true);
    expect(canTransitionOrder("ready", "picked_up")).toBe(true);
  });

  it.each<[OrderStatus, OrderStatus]>([
    ["placed", "ready"],
    ["preparing", "accepted"],
    ["picked_up", "placed"],
    ["cancelled", "accepted"],
  ])("rejects %s → %s", (from, to) => {
    expect(canTransitionOrder(from, to)).toBe(false);
  });
});
