import { Car, Home, Sparkles, Wrench } from "lucide-react";
//#region src/modules/listings/model/display.ts
/** Lucide icon per top-level listing category. */
var CATEGORY_ICONS = {
	property: Home,
	vehicle: Car,
	service: Wrench,
	experience: Sparkles
};
/** CSS custom property for the accent color of each category. */
var CATEGORY_ACCENT_VAR = {
	property: "var(--cat-property)",
	vehicle: "var(--cat-vehicle)",
	service: "var(--cat-service)",
	experience: "var(--cat-experience)"
};
/** Shared editorial easing curve (quartic out). */
var EDITORIAL_EASE = [
	.25,
	1,
	.5,
	1
];
var PRICE_PERIOD_SUFFIX = {
	monthly: "/mo",
	daily: "/day",
	hourly: "/hr"
};
function resolveLocale(languageCode) {
	return languageCode === "es" ? "es-ES" : "en-DK";
}
function formatListingPrice(price, currency, pricePeriod, languageCode) {
	return {
		amount: new Intl.NumberFormat(resolveLocale(languageCode), {
			style: "currency",
			currency: currency ?? "DKK",
			maximumFractionDigits: 0
		}).format(price),
		suffix: pricePeriod && pricePeriod !== "one_time" ? PRICE_PERIOD_SUFFIX[pricePeriod] : ""
	};
}
//#endregion
export { formatListingPrice as i, CATEGORY_ICONS as n, EDITORIAL_EASE as r, CATEGORY_ACCENT_VAR as t };
