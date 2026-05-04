import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
createServerFn({ method: "GET" }).handler(createSsrRpc("26b3366957b2a8598345b4c1cb62a8b116d3a6fe90b4577753278598166b9c79"));
var getRecentListingsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("4d956afcd24172f7e26241eba02632a12c6143fe3e147deff9f8bc71c47e7f59"));
/**
* Lightweight counters used by the sidebar badges + topbar.
* Cheap enough to poll every 60s.
*/
var getAdminBadgesFn = createServerFn({ method: "GET" }).handler(createSsrRpc("81c0a7fcea919953b16ab082cabd48320420fb70318cd6e42d0f68b97c35c340"));
/**
* Full dashboard payload — hero numbers, deltas, pipeline, top sources,
* and per-category breakdown with published share.
*/
var getAdminDashboardFn = createServerFn({ method: "GET" }).handler(createSsrRpc("66e25fe607fe282ee73a07b84c1adda53b15d8e66777f9a370905df5fb98e11c"));
/**
* Weekly published-listing counts for the last N weeks, broken down by category.
* Used to draw the trend sparkline + stacked-area chart on the dashboard.
*/
var getListingsTrendFn = createServerFn({ method: "GET" }).handler(createSsrRpc("f61899677f8c1aece05386863161926b60df39087e7260904498af0de5a1b5f0"));
//#endregion
export { getRecentListingsFn as i, getAdminDashboardFn as n, getListingsTrendFn as r, getAdminBadgesFn as t };
