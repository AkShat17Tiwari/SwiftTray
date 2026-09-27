export type RazorpayPaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "refunded"
  | "failed";

export interface RazorpayOrder {
  id: string;
  entity: "order";
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  attempts: number;
}

export interface RazorpayPayment {
  id: string;
  entity: "payment";
  amount: number;
  currency: string;
  status: RazorpayPaymentStatus;
  order_id: string | null;
  captured: boolean;
  error_code?: string | null;
  error_description?: string | null;
}

export interface RazorpayRefund {
  id: string;
  entity: "refund";
  payment_id: string;
  amount: number;
  currency: string;
  status: "pending" | "processed" | "failed";
}

export interface RazorpayWebhookEvent {
  event: string;
  created_at: number;
  payload?: {
    payment?: { entity?: RazorpayPayment };
    order?: { entity?: RazorpayOrder };
    refund?: { entity?: RazorpayRefund };
  };
}

export interface RazorpayCheckoutResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color: string };
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}
