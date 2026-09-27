export function moneyToPaise(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Money amount cannot be negative.");
  }
  return Math.round((amount + Number.EPSILON) * 100);
}

export function paiseToMoney(amountInPaise: number): number {
  if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 0) {
    throw new Error("Paise amount must be a non-negative whole number.");
  }
  return amountInPaise / 100;
}
