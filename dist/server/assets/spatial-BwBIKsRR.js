import { c as listings } from "./schema-jrpEASXZ.js";
import { and, gte, lte, sql } from "drizzle-orm";
//#region src/shared/lib/db/spatial.ts
/** Earth radius in km. */
var EARTH_RADIUS_KM = 6371;
/**
* Build a Drizzle SQL condition filtering listings within `radiusKm` of (lat, lng).
* Uses the Haversine formula in SQL and a bounding-box prefilter so PostgreSQL
* can use the (latitude, longitude) btree indexes before evaluating trig.
*/
function haversineCondition(lat, lng, radiusKm) {
	const latDelta = radiusKm / 111;
	const lngDelta = radiusKm / (111 * Math.max(Math.cos(lat * Math.PI / 180), .01));
	return and(and(gte(listings.latitude, lat - latDelta), lte(listings.latitude, lat + latDelta), gte(listings.longitude, lng - lngDelta), lte(listings.longitude, lng + lngDelta)), sql`${EARTH_RADIUS_KM} * acos(
    LEAST(1.0, GREATEST(-1.0,
      cos(radians(${lat})) * cos(radians(${listings.latitude})) *
      cos(radians(${listings.longitude}) - radians(${lng})) +
      sin(radians(${lat})) * sin(radians(${listings.latitude}))
    ))
  ) <= ${radiusKm}`);
}
/** Compute a simple lat/lng bounding box for a polygon ring. */
function polygonBbox(poly) {
	let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
	for (const [lng, lat] of poly) {
		if (lat < minLat) minLat = lat;
		if (lat > maxLat) maxLat = lat;
		if (lng < minLng) minLng = lng;
		if (lng > maxLng) maxLng = lng;
	}
	return {
		minLat,
		maxLat,
		minLng,
		maxLng
	};
}
/** Drizzle SQL condition restricting to the polygon's axis-aligned bounding box. */
function polygonBboxCondition(poly) {
	const { minLat, maxLat, minLng, maxLng } = polygonBbox(poly);
	return and(gte(listings.latitude, minLat), lte(listings.latitude, maxLat), gte(listings.longitude, minLng), lte(listings.longitude, maxLng));
}
/**
* Ray-casting point-in-polygon test. Works with [lng, lat] rings.
* Not a hot path — used as a post-filter after the bbox SQL prune.
*/
function pointInPolygon(lng, lat, poly) {
	let inside = false;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const [xi, yi] = poly[i];
		const [xj, yj] = poly[j];
		if (yi > lat !== yj > lat && lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi) inside = !inside;
	}
	return inside;
}
/**
* Encode polygon to a compact URL-safe string.
* Format: `lng1,lat1_lng2,lat2_...` with 5 decimal precision (~1m).
*/
function encodePolygon(poly) {
	return poly.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join("_");
}
/** Decode URL string back to polygon. Returns null if invalid or <3 points. */
function decodePolygon(str) {
	if (!str) return null;
	const parts = str.split("_");
	if (parts.length < 3) return null;
	const ring = [];
	for (const p of parts) {
		const [lngStr, latStr] = p.split(",");
		const lng = Number(lngStr);
		const lat = Number(latStr);
		if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
		ring.push([lng, lat]);
	}
	return ring;
}
//#endregion
export { polygonBboxCondition as a, pointInPolygon as i, encodePolygon as n, haversineCondition as r, decodePolygon as t };
