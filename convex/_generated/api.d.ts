/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as announcements from "../announcements.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as coupons from "../coupons.js";
import type * as dashboards from "../dashboards.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_money from "../lib/money.js";
import type * as lib_orderState from "../lib/orderState.js";
import type * as lib_portalAccess from "../lib/portalAccess.js";
import type * as lib_razorpay from "../lib/razorpay.js";
import type * as menuItems from "../menuItems.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as outlets from "../outlets.js";
import type * as payments from "../payments.js";
import type * as portalAccess from "../portalAccess.js";
import type * as seed from "../seed.js";
import type * as supportTickets from "../supportTickets.js";
import type * as users from "../users.js";
import type * as vendorAssignments from "../vendorAssignments.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  announcements: typeof announcements;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  coupons: typeof coupons;
  dashboards: typeof dashboards;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/money": typeof lib_money;
  "lib/orderState": typeof lib_orderState;
  "lib/portalAccess": typeof lib_portalAccess;
  "lib/razorpay": typeof lib_razorpay;
  menuItems: typeof menuItems;
  notifications: typeof notifications;
  orders: typeof orders;
  outlets: typeof outlets;
  payments: typeof payments;
  portalAccess: typeof portalAccess;
  seed: typeof seed;
  supportTickets: typeof supportTickets;
  users: typeof users;
  vendorAssignments: typeof vendorAssignments;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
