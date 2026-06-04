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
import type * as coupons from "../coupons.js";
import type * as dashboards from "../dashboards.js";
import type * as menuItems from "../menuItems.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as outlets from "../outlets.js";
import type * as securityEvents from "../securityEvents.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as vendorAssignments from "../vendorAssignments.js";
import type * as vendorKeys from "../vendorKeys.js";
import type * as vendorPortalKeys from "../vendorPortalKeys.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  announcements: typeof announcements;
  auditLogs: typeof auditLogs;
  coupons: typeof coupons;
  dashboards: typeof dashboards;
  menuItems: typeof menuItems;
  notifications: typeof notifications;
  orders: typeof orders;
  outlets: typeof outlets;
  securityEvents: typeof securityEvents;
  seed: typeof seed;
  users: typeof users;
  vendorAssignments: typeof vendorAssignments;
  vendorKeys: typeof vendorKeys;
  vendorPortalKeys: typeof vendorPortalKeys;
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

export declare const components: {};
