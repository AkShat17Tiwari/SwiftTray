import { describe, expect, it } from "vitest";
import { cartLineKey } from "../src/hooks/use-cart";

describe("cart line identity", () => {
  it("keeps differently customized versions as separate lines", () => {
    const base = { menuItemId: "item-1", specialInstructions: undefined };
    const mild = cartLineKey({ ...base, customizations: [{ name: "Spice", selected: "Mild", price: 0 }] });
    const hot = cartLineKey({ ...base, customizations: [{ name: "Spice", selected: "Hot", price: 0 }] });
    expect(mild).not.toBe(hot);
  });

  it("merges identical configurations", () => {
    const item = { menuItemId: "item-1", customizations: [{ name: "Size", selected: "Large", price: 30 }], specialInstructions: "No onion" };
    expect(cartLineKey(item)).toBe(cartLineKey({ ...item }));
  });
});
