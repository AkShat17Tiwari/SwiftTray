export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "picked_up"
  | "cancelled";

const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["picked_up"],
  picked_up: [],
  cancelled: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return allowedTransitions[from].includes(to);
}
