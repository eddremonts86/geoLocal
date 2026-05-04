import { t as createServerFn } from "../server.js";
import { t as cn } from "./utils-C17k1q7P.js";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip$1 } from "./tooltip-BJcKbcup.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { t as Button } from "./button-D7roF92S.js";
import { t as useTheme } from "./useTheme-DhaMcgB6.js";
import { t as useFavorites } from "./useFavorites-Biw4cw7b.js";
import { t as Badge } from "./badge-C9JK8Bm8.js";
import { t as Separator$1 } from "./separator-DWQzvVw_.js";
import { a as DropdownMenuSeparator, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu$1 } from "./dropdown-menu-DK24gMQb.js";
import { i as formatListingPrice, r as EDITORIAL_EASE, t as CATEGORY_ACCENT_VAR } from "./display-cXPC5DSr.js";
import * as React$1 from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { createPortal } from "react-dom";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Popover, Toggle, ToggleGroup } from "radix-ui";
import { ArrowRight, Award, Bath, Bed, Calendar, Check, Clock, Compass, ExternalLink, Fuel, Gauge, Heart, Hexagon, Layers, Link as Link$1, LocateFixed, Mail, MapPin, Maximize, MessageCircle, Minus, Mountain, MousePointerClick, ParkingCircle, Plus, Settings, Share2, Users, X, Zap } from "lucide-react";
import { cva } from "class-variance-authority";
import maplibregl from "maplibre-gl";
//#region src/modules/listings/api/listings.fn.ts
var searchInputSchema = z.object({
	category: z.enum([
		"property",
		"vehicle",
		"service",
		"experience"
	]).optional(),
	subCategory: z.array(z.string()).optional(),
	transactionType: z.enum([
		"buy",
		"rent",
		"hire"
	]).optional(),
	query: z.string().optional(),
	priceMin: z.number().optional(),
	priceMax: z.number().optional(),
	sort: z.enum([
		"popular",
		"newest",
		"price_asc",
		"price_desc"
	]).optional().default("newest"),
	page: z.number().optional().default(1),
	pageSize: z.number().optional().default(20),
	locale: z.string().optional().default("en"),
	boundsNorth: z.number().optional(),
	boundsSouth: z.number().optional(),
	boundsEast: z.number().optional(),
	boundsWest: z.number().optional(),
	nearLat: z.number().optional(),
	nearLng: z.number().optional(),
	nearRadiusKm: z.number().min(.1).max(500).optional(),
	polygon: z.string().optional(),
	sourceKind: z.enum(["user", "scraped"]).optional(),
	scrapedSource: z.array(z.string()).optional(),
	bedrooms: z.array(z.union([z.number(), z.literal("studio")])).optional(),
	bathrooms: z.number().optional(),
	areaMin: z.number().optional(),
	areaMax: z.number().optional(),
	yearBuiltMin: z.number().optional(),
	yearBuiltMax: z.number().optional(),
	parkingMin: z.number().optional(),
	furnished: z.boolean().optional(),
	make: z.array(z.string()).optional(),
	yearMin: z.number().optional(),
	yearMax: z.number().optional(),
	fuelType: z.array(z.enum([
		"gasoline",
		"diesel",
		"electric",
		"hybrid"
	])).optional(),
	transmission: z.enum(["manual", "automatic"]).optional(),
	mileageMax: z.number().optional(),
	doorsMin: z.number().optional(),
	colors: z.array(z.string()).optional(),
	experienceMin: z.number().optional(),
	serviceRadiusMin: z.number().optional(),
	responseTime: z.enum([
		"within_hour",
		"same_day",
		"few_days"
	]).optional(),
	certified: z.boolean().optional(),
	durationMin: z.number().optional(),
	durationMax: z.number().optional(),
	groupMax: z.number().optional(),
	minAgeMax: z.number().optional(),
	languages: z.array(z.string()).optional(),
	difficulty: z.enum([
		"easy",
		"moderate",
		"hard"
	]).optional()
});
var searchListingsFn = createServerFn({ method: "GET" }).inputValidator(searchInputSchema).handler(createSsrRpc("e53cc75e2054c57b7158e24edb1292e49eb3e938a08e2c6784c29f79abcb672b"));
var getListingBySlugFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	slug: z.string(),
	locale: z.string().default("en")
})).handler(createSsrRpc("7e5929e9ff99e3f2069d820cc5d1474d1a981479eb0d3df677c9569ced879b8f"));
var getSimilarListingsFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	category: z.enum([
		"property",
		"vehicle",
		"service",
		"experience"
	]),
	city: z.string().optional(),
	excludeId: z.string(),
	limit: z.number().default(3),
	locale: z.string().default("en")
})).handler(createSsrRpc("ae2e7a6177a9d0793b828af0d07977229d54b38b6469697b8b9a710bcbab9e5b"));
var getFeaturedListingsFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	limit: z.number().default(12),
	locale: z.string().default("en")
})).handler(createSsrRpc("c5b408067539b289f066c2622c1dc33cf351143919567a1e7b6197749403fc3d"));
var mapMarkersInputSchema = z.object({
	category: z.enum([
		"property",
		"vehicle",
		"service",
		"experience"
	]).optional(),
	subCategory: z.array(z.string()).optional(),
	transactionType: z.enum([
		"buy",
		"rent",
		"hire"
	]).optional(),
	priceMin: z.number().optional(),
	priceMax: z.number().optional(),
	sourceKind: z.enum(["user", "scraped"]).optional(),
	scrapedSource: z.array(z.string()).optional(),
	bedrooms: z.array(z.union([z.number(), z.literal("studio")])).optional(),
	bathrooms: z.number().optional(),
	areaMin: z.number().optional(),
	areaMax: z.number().optional(),
	yearBuiltMin: z.number().optional(),
	yearBuiltMax: z.number().optional(),
	parkingMin: z.number().optional(),
	furnished: z.boolean().optional(),
	make: z.array(z.string()).optional(),
	yearMin: z.number().optional(),
	yearMax: z.number().optional(),
	fuelType: z.array(z.enum([
		"gasoline",
		"diesel",
		"electric",
		"hybrid"
	])).optional(),
	transmission: z.enum(["manual", "automatic"]).optional(),
	mileageMax: z.number().optional(),
	doorsMin: z.number().optional(),
	colors: z.array(z.string()).optional(),
	experienceMin: z.number().optional(),
	serviceRadiusMin: z.number().optional(),
	responseTime: z.enum([
		"within_hour",
		"same_day",
		"few_days"
	]).optional(),
	certified: z.boolean().optional(),
	durationMin: z.number().optional(),
	durationMax: z.number().optional(),
	groupMax: z.number().optional(),
	minAgeMax: z.number().optional(),
	languages: z.array(z.string()).optional(),
	difficulty: z.enum([
		"easy",
		"moderate",
		"hard"
	]).optional(),
	nearLat: z.number().optional(),
	nearLng: z.number().optional(),
	nearRadiusKm: z.number().min(.1).max(500).optional(),
	polygon: z.string().optional(),
	limit: z.number().min(1).max(5e4).default(1e4)
});
/**
* Lightweight markers endpoint for the map. Returns ALL matching listings
* (capped at `limit`, default 10k, max 50k) with minimal fields — no
* translations, no covers, no bounds. Feeds a clustered GeoJSON source so
* tens of thousands of pins render smoothly.
*/
var getMapMarkersFn = createServerFn({ method: "GET" }).inputValidator(mapMarkersInputSchema).handler(createSsrRpc("398eeac2d7ddc049052377cc773688d0ab34697b8f3684fc3f652af848b36f07"));
var getScrapedListingsFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	limit: z.number().default(12),
	locale: z.string().default("en")
})).handler(createSsrRpc("8001d9a2c4621b6c69f2fa08c181ec576832a8fc1c08474ec70f3ea8bffb1445"));
/**
* Aggregate stats + imagery for the home page. Returns:
* - totals per category
* - top N neighborhoods (city / district) by listing count
* - one hero image + featured markers for the hero map
* - sample covers per vertical
*/
var getHomeStatsFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	neighborhoodLimit: z.number().default(8),
	samplesPerVertical: z.number().default(3),
	heroMarkersLimit: z.number().default(40),
	locale: z.string().default("en")
})).handler(createSsrRpc("80aaeedbd827930c04411db74c2c742359d4e8c80ca03e419c5b652431b55331"));
//#endregion
//#region src/modules/listings/api/queries.ts
var listingKeys = {
	all: ["listings"],
	lists: () => [...listingKeys.all, "list"],
	list: (filters) => [...listingKeys.lists(), filters],
	details: () => [...listingKeys.all, "detail"],
	detail: (slug) => [...listingKeys.details(), slug],
	featured: (limit) => [
		...listingKeys.all,
		"featured",
		limit
	],
	scraped: (limit) => [
		...listingKeys.all,
		"scraped",
		limit
	],
	mapMarkers: (filters) => [
		...listingKeys.all,
		"mapMarkers",
		filters
	],
	similar: (category, city, excludeId, limit) => [
		...listingKeys.all,
		"similar",
		category,
		city ?? "_any_",
		excludeId,
		limit
	],
	homeStats: (locale) => [
		...listingKeys.all,
		"homeStats",
		locale
	]
};
function listingInfiniteQueryOptions(filters) {
	return infiniteQueryOptions({
		queryKey: [...listingKeys.list(filters), "infinite"],
		queryFn: ({ pageParam = 1 }) => searchListingsFn({ data: {
			category: filters.category,
			subCategory: filters.subCategory,
			transactionType: filters.transactionType,
			query: filters.query,
			priceMin: filters.priceMin,
			priceMax: filters.priceMax,
			boundsNorth: filters.bounds?.north,
			boundsSouth: filters.bounds?.south,
			boundsEast: filters.bounds?.east,
			boundsWest: filters.bounds?.west,
			nearLat: filters.nearLat,
			nearLng: filters.nearLng,
			nearRadiusKm: filters.nearRadiusKm,
			polygon: filters.polygon,
			sort: filters.sort ?? "newest",
			page: pageParam,
			pageSize: filters.pageSize ?? 20,
			locale: filters.locale ?? "en",
			sourceKind: filters.sourceKind,
			scrapedSource: filters.scrapedSource,
			bedrooms: filters.bedrooms,
			bathrooms: filters.bathrooms,
			areaMin: filters.areaMin,
			areaMax: filters.areaMax,
			yearBuiltMin: filters.yearBuiltMin,
			yearBuiltMax: filters.yearBuiltMax,
			parkingMin: filters.parkingMin,
			furnished: filters.furnished,
			make: filters.make,
			yearMin: filters.yearMin,
			yearMax: filters.yearMax,
			fuelType: filters.fuelType,
			transmission: filters.transmission,
			mileageMax: filters.mileageMax,
			doorsMin: filters.doorsMin,
			colors: filters.colors,
			experienceMin: filters.experienceMin,
			serviceRadiusMin: filters.serviceRadiusMin,
			responseTime: filters.responseTime,
			certified: filters.certified,
			durationMin: filters.durationMin,
			durationMax: filters.durationMax,
			groupMax: filters.groupMax,
			minAgeMax: filters.minAgeMax,
			languages: filters.languages,
			difficulty: filters.difficulty
		} }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const nextPage = lastPage.page + 1;
			return nextPage * lastPage.pageSize <= lastPage.total + lastPage.pageSize ? nextPage : void 0;
		}
	});
}
function listingDetailQueryOptions(slug, locale = "en") {
	return queryOptions({
		queryKey: listingKeys.detail(slug),
		queryFn: () => getListingBySlugFn({ data: {
			slug,
			locale
		} }),
		enabled: !!slug
	});
}
function featuredListingsQueryOptions(limit = 12, locale = "en") {
	return queryOptions({
		queryKey: listingKeys.featured(limit),
		queryFn: () => getFeaturedListingsFn({ data: {
			limit,
			locale
		} }),
		staleTime: 1e3 * 60 * 5
	});
}
function scrapedListingsQueryOptions(limit = 12, locale = "en") {
	return queryOptions({
		queryKey: listingKeys.scraped(limit),
		queryFn: () => getScrapedListingsFn({ data: {
			limit,
			locale
		} }),
		staleTime: 1e3 * 60 * 5
	});
}
function mapMarkersQueryOptions(filters) {
	return queryOptions({
		queryKey: listingKeys.mapMarkers(filters),
		queryFn: () => getMapMarkersFn({ data: {
			category: filters.category,
			subCategory: filters.subCategory,
			transactionType: filters.transactionType,
			priceMin: filters.priceMin,
			priceMax: filters.priceMax,
			sourceKind: filters.sourceKind,
			scrapedSource: filters.scrapedSource,
			bedrooms: filters.bedrooms,
			bathrooms: filters.bathrooms,
			areaMin: filters.areaMin,
			areaMax: filters.areaMax,
			yearBuiltMin: filters.yearBuiltMin,
			yearBuiltMax: filters.yearBuiltMax,
			parkingMin: filters.parkingMin,
			furnished: filters.furnished,
			make: filters.make,
			yearMin: filters.yearMin,
			yearMax: filters.yearMax,
			fuelType: filters.fuelType,
			transmission: filters.transmission,
			mileageMax: filters.mileageMax,
			doorsMin: filters.doorsMin,
			colors: filters.colors,
			experienceMin: filters.experienceMin,
			serviceRadiusMin: filters.serviceRadiusMin,
			responseTime: filters.responseTime,
			certified: filters.certified,
			durationMin: filters.durationMin,
			durationMax: filters.durationMax,
			groupMax: filters.groupMax,
			minAgeMax: filters.minAgeMax,
			languages: filters.languages,
			difficulty: filters.difficulty,
			nearLat: filters.nearLat,
			nearLng: filters.nearLng,
			nearRadiusKm: filters.nearRadiusKm,
			polygon: filters.polygon,
			limit: 1e4
		} }),
		staleTime: 1e3 * 60 * 2
	});
}
function similarListingsQueryOptions(category, city, excludeId, limit = 3, locale = "en") {
	return queryOptions({
		queryKey: listingKeys.similar(category, city, excludeId, limit),
		queryFn: () => getSimilarListingsFn({ data: {
			category,
			city,
			excludeId,
			limit,
			locale
		} }),
		enabled: !!excludeId,
		staleTime: 1e3 * 60 * 5
	});
}
function homeStatsQueryOptions(locale = "en") {
	return queryOptions({
		queryKey: listingKeys.homeStats(locale),
		queryFn: () => getHomeStatsFn({ data: { locale } }),
		staleTime: 1e3 * 60 * 5
	});
}
//#endregion
//#region src/modules/listings/cards/PropertyCard.tsx
function PropertyCardMetrics({ item }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-3 text-xs text-muted-foreground",
		children: [
			item.bedrooms != null && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Bed, { className: "h-3.5 w-3.5" }),
					" ",
					item.bedrooms
				]
			}),
			item.bathrooms != null && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Bath, { className: "h-3.5 w-3.5" }),
					" ",
					item.bathrooms
				]
			}),
			item.areaSqm != null && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Maximize, { className: "h-3.5 w-3.5" }),
					" ",
					item.areaSqm,
					" m²"
				]
			}),
			item.parkingSpaces != null && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(ParkingCircle, { className: "h-3.5 w-3.5" }),
					" ",
					item.parkingSpaces
				]
			})
		]
	});
}
//#endregion
//#region src/modules/listings/cards/VehicleCard.tsx
function VehicleCardMetrics({ item }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-3 text-xs text-muted-foreground",
		children: [
			/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
					" ",
					item.year
				]
			}),
			item.mileageKm != null && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Gauge, { className: "h-3.5 w-3.5" }),
					" ",
					(item.mileageKm / 1e3).toFixed(0),
					"k km"
				]
			}),
			item.fuelType && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Fuel, { className: "h-3.5 w-3.5" }),
					" ",
					item.fuelType
				]
			}),
			item.transmission && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5" }),
					" ",
					item.transmission
				]
			})
		]
	});
}
//#endregion
//#region src/modules/listings/cards/ServiceCard.tsx
function ServiceCardMetrics({ item }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-3 text-xs text-muted-foreground",
		children: [
			item.experienceYears != null && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Award, { className: "h-3.5 w-3.5" }),
					" ",
					item.experienceYears,
					" yrs"
				]
			}),
			item.responseTime && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
					" ",
					item.responseTime
				]
			}),
			item.serviceRadiusKm != null && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
					" ",
					item.serviceRadiusKm,
					" km"
				]
			})
		]
	});
}
//#endregion
//#region src/modules/listings/cards/ExperienceCard.tsx
var DIFFICULTY_LABELS = {
	easy: "Easy",
	moderate: "Moderate",
	challenging: "Challenging"
};
function ExperienceCardMetrics({ item }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-3 text-xs text-muted-foreground",
		children: [
			item.durationHours != null && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }), item.durationHours < 1 ? `${Math.round(item.durationHours * 60)}min` : `${item.durationHours}h`]
			}),
			item.maxGuests != null && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" }),
					" Up to ",
					item.maxGuests
				]
			}),
			item.difficulty && /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ jsx(Mountain, { className: "h-3.5 w-3.5" }), DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty]
			})
		]
	});
}
//#endregion
//#region src/modules/listings/ui/ShareMenu.tsx
/**
* Share control with:
* - Native `navigator.share()` on supported clients (mobile Safari/Chrome).
* - Dropdown fallback with copy link + social targets.
*
* Safe on SSR — guards all `window`/`navigator` access.
*/
function ShareMenu({ url, title, text, className, buttonStyle, ariaLabel }) {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);
	const [open, setOpen] = useState(false);
	const resolveUrl = useCallback(() => {
		if (url) return url;
		if (typeof window !== "undefined") return window.location.href;
		return "";
	}, [url]);
	const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
	const handleTriggerClick = useCallback(async (e) => {
		if (!canNativeShare) return;
		e.preventDefault();
		try {
			await navigator.share({
				title,
				text,
				url: resolveUrl()
			});
		} catch {
			setOpen(true);
		}
	}, [
		canNativeShare,
		resolveUrl,
		text,
		title
	]);
	const handleCopy = useCallback(async () => {
		const shareUrl = resolveUrl();
		if (!shareUrl) return;
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2e3);
		} catch {
			if (typeof window !== "undefined") window.prompt(t("share.copyFallback", "Copy this link"), shareUrl);
		}
	}, [resolveUrl, t]);
	const openTarget = (href) => {
		if (typeof window !== "undefined") window.open(href, "_blank", "noopener,noreferrer");
	};
	const shareUrl = typeof window !== "undefined" ? resolveUrl() : "";
	const encodedUrl = encodeURIComponent(shareUrl);
	const encodedTitle = encodeURIComponent(title);
	const encodedText = encodeURIComponent(text ?? title);
	const triggerBtn = /* @__PURE__ */ jsx(Button, {
		variant: "ghost",
		size: "icon",
		className: className ?? "rounded-none",
		style: buttonStyle ?? { color: "var(--ink-3)" },
		"aria-label": ariaLabel ?? t("share.label", "Share"),
		onClick: canNativeShare ? handleTriggerClick : void 0,
		children: /* @__PURE__ */ jsx(Share2, {
			className: "h-4 w-4",
			strokeWidth: 1.5
		})
	});
	if (canNativeShare) return triggerBtn;
	return /* @__PURE__ */ jsxs(DropdownMenu$1, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
			asChild: true,
			children: triggerBtn
		}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
			align: "end",
			className: "w-56 rounded-none",
			children: [
				/* @__PURE__ */ jsx(DropdownMenuItem, {
					onSelect: (e) => {
						e.preventDefault();
						handleCopy();
					},
					children: copied ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Check, {
						className: "mr-2 h-4 w-4",
						strokeWidth: 1.5,
						style: { color: "var(--amber-ink)" }
					}), /* @__PURE__ */ jsx("span", { children: t("share.copied", "Link copied") })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Link$1, {
						className: "mr-2 h-4 w-4",
						strokeWidth: 1.5
					}), /* @__PURE__ */ jsx("span", { children: t("share.copyLink", "Copy link") })] })
				}),
				/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
				/* @__PURE__ */ jsxs(DropdownMenuItem, {
					onSelect: (e) => {
						e.preventDefault();
						openTarget(`https://wa.me/?text=${encodedText}%20${encodedUrl}`);
					},
					children: [/* @__PURE__ */ jsx(MessageCircle, {
						className: "mr-2 h-4 w-4",
						strokeWidth: 1.5
					}), /* @__PURE__ */ jsx("span", { children: "WhatsApp" })]
				}),
				/* @__PURE__ */ jsxs(DropdownMenuItem, {
					onSelect: (e) => {
						e.preventDefault();
						openTarget(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`);
					},
					children: [/* @__PURE__ */ jsx("svg", {
						className: "mr-2 h-4 w-4",
						viewBox: "0 0 24 24",
						fill: "currentColor",
						"aria-hidden": true,
						children: /* @__PURE__ */ jsx("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" })
					}), /* @__PURE__ */ jsx("span", { children: "X (Twitter)" })]
				}),
				/* @__PURE__ */ jsxs(DropdownMenuItem, {
					onSelect: (e) => {
						e.preventDefault();
						openTarget(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
					},
					children: [/* @__PURE__ */ jsx("svg", {
						className: "mr-2 h-4 w-4",
						viewBox: "0 0 24 24",
						fill: "currentColor",
						"aria-hidden": true,
						children: /* @__PURE__ */ jsx("path", { d: "M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.3-1.5 1.6-1.5H17V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.1V10.5H8v3h2.5V21z" })
					}), /* @__PURE__ */ jsx("span", { children: "Facebook" })]
				}),
				/* @__PURE__ */ jsxs(DropdownMenuItem, {
					onSelect: (e) => {
						e.preventDefault();
						openTarget(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
					},
					children: [/* @__PURE__ */ jsxs("svg", {
						className: "mr-2 h-4 w-4",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.5",
						children: [
							/* @__PURE__ */ jsx("path", { d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" }),
							/* @__PURE__ */ jsx("rect", {
								x: "2",
								y: "9",
								width: "4",
								height: "12"
							}),
							/* @__PURE__ */ jsx("circle", {
								cx: "4",
								cy: "4",
								r: "2"
							})
						]
					}), /* @__PURE__ */ jsx("span", { children: "LinkedIn" })]
				}),
				/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
				/* @__PURE__ */ jsxs(DropdownMenuItem, {
					onSelect: (e) => {
						e.preventDefault();
						openTarget(`mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`);
					},
					children: [/* @__PURE__ */ jsx(Mail, {
						className: "mr-2 h-4 w-4",
						strokeWidth: 1.5
					}), /* @__PURE__ */ jsx("span", { children: t("share.email", "Email") })]
				})
			]
		})]
	});
}
//#endregion
//#region src/modules/listings/ui/ListingCard.tsx
var SOURCE_LABELS = {
	airbnb: "Airbnb",
	facebook: "Facebook",
	"facebook-events": "FB Events",
	linkedin: "LinkedIn"
};
var SOURCE_COLORS = {
	airbnb: "#FF5A5F",
	facebook: "#1877F2",
	"facebook-events": "#9333EA",
	linkedin: "#0A66C2"
};
var PLACEHOLDER = "/img-placeholder.svg";
var handleImgError = (e) => {
	e.currentTarget.src = PLACEHOLDER;
	e.currentTarget.onerror = null;
};
function ListingCard({ item, isActive, isFavorite, onSelect, onFavorite, variant = "default" }) {
	const { i18n, t } = useTranslation();
	const navigate = useNavigate();
	const accent = CATEGORY_ACCENT_VAR[item.category] ?? "var(--amber-ink)";
	const favorites = useFavorites();
	const effectiveIsFavorite = onFavorite ? isFavorite : favorites.isFavorite(item.id);
	const effectiveOnFavorite = onFavorite ?? (() => favorites.toggle(item.id));
	const handleCardClick = () => {
		onSelect?.();
	};
	const handleNavigate = (e) => {
		e.stopPropagation();
		navigate({
			to: "/listing/$slug",
			params: { slug: item.slug }
		});
	};
	const { amount: formattedPrice, suffix: priceSuffix } = formatListingPrice(item.price, item.currency, item.pricePeriod, i18n.language);
	if (variant === "bubble") return /* @__PURE__ */ jsxs("div", {
		className: "w-56 overflow-hidden",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative h-32 w-full overflow-hidden bg-(--surface-3)",
			children: [
				/* @__PURE__ */ jsx("img", {
					src: item.coverUrl ?? PLACEHOLDER,
					alt: "",
					className: "h-full w-full object-cover",
					onError: handleImgError
				}),
				/* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" }),
				/* @__PURE__ */ jsx("span", {
					className: "absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white",
					style: { backgroundColor: accent },
					children: item.transactionType
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: (e) => {
						e.preventDefault();
						e.stopPropagation();
						effectiveOnFavorite();
					},
					"aria-label": effectiveIsFavorite ? "Remove from favorites" : "Save to favorites",
					className: "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/85 backdrop-blur-sm transition-colors hover:bg-background",
					children: /* @__PURE__ */ jsx(Heart, {
						className: "h-3.5 w-3.5",
						strokeWidth: 1.5,
						style: {
							fill: effectiveIsFavorite ? "var(--red)" : "transparent",
							stroke: effectiveIsFavorite ? "var(--red)" : "var(--ink-2)"
						}
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "absolute right-10 top-2",
					onClick: (e) => e.stopPropagation(),
					children: /* @__PURE__ */ jsx(ShareMenu, {
						url: typeof window !== "undefined" ? `${window.location.origin}/listing/${item.slug}` : void 0,
						title: item.title,
						text: item.summary ?? void 0,
						className: "h-7 w-7 rounded-full bg-background/85 p-0 backdrop-blur-sm hover:bg-background",
						buttonStyle: { color: "var(--ink-2)" },
						ariaLabel: t("share.label", "Share")
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "absolute bottom-2 left-2.5",
					children: /* @__PURE__ */ jsxs("p", {
						className: "font-display text-base font-semibold tabular-nums leading-tight text-white",
						children: [formattedPrice, priceSuffix && /* @__PURE__ */ jsx("span", {
							className: "text-[0.65rem] font-normal opacity-80",
							children: priceSuffix
						})]
					})
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "px-3 pb-3 pt-2.5",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "mb-0.5 line-clamp-2 text-xs font-medium leading-snug text-foreground",
					children: item.title
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mb-2 text-[0.65rem]",
					style: { color: "var(--ink-3)" },
					children: [item.city, item.neighborhood ? ` · ${item.neighborhood}` : ""]
				}),
				item.category === "vehicle" && /* @__PURE__ */ jsxs("div", {
					className: "mb-2.5 flex flex-wrap gap-x-2.5 gap-y-1",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-[0.65rem]",
							style: { color: "var(--ink-2)" },
							children: [/* @__PURE__ */ jsxs("svg", {
								className: "h-3 w-3 shrink-0",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								children: [
									/* @__PURE__ */ jsx("rect", {
										x: "3",
										y: "4",
										width: "18",
										height: "18",
										rx: "2"
									}),
									/* @__PURE__ */ jsx("line", {
										x1: "16",
										y1: "2",
										x2: "16",
										y2: "6"
									}),
									/* @__PURE__ */ jsx("line", {
										x1: "8",
										y1: "2",
										x2: "8",
										y2: "6"
									}),
									/* @__PURE__ */ jsx("line", {
										x1: "3",
										y1: "10",
										x2: "21",
										y2: "10"
									})
								]
							}), item.year]
						}),
						item.mileageKm != null && /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-[0.65rem]",
							style: { color: "var(--ink-2)" },
							children: [
								/* @__PURE__ */ jsxs("svg", {
									className: "h-3 w-3 shrink-0",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									children: [/* @__PURE__ */ jsx("path", { d: "M12 2a10 10 0 1 0 10 10" }), /* @__PURE__ */ jsx("path", { d: "M12 12l4-4" })]
								}),
								(item.mileageKm / 1e3).toFixed(0),
								"k km"
							]
						}),
						item.fuelType && /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-[0.65rem]",
							style: { color: "var(--ink-2)" },
							children: [/* @__PURE__ */ jsxs("svg", {
								className: "h-3 w-3 shrink-0",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								children: [
									/* @__PURE__ */ jsx("path", { d: "M3 22V8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14" }),
									/* @__PURE__ */ jsx("path", { d: "M14 8h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h0" }),
									/* @__PURE__ */ jsx("line", {
										x1: "3",
										y1: "22",
										x2: "16",
										y2: "22"
									})
								]
							}), item.fuelType]
						})
					]
				}),
				item.category === "property" && /* @__PURE__ */ jsxs("div", {
					className: "mb-2.5 flex flex-wrap gap-x-2.5 gap-y-1",
					children: [
						item.bedrooms != null && /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-[0.65rem]",
							style: { color: "var(--ink-2)" },
							children: [
								/* @__PURE__ */ jsxs("svg", {
									className: "h-3 w-3 shrink-0",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									children: [/* @__PURE__ */ jsx("path", { d: "M3 22V12a9 9 0 0 1 18 0v10" }), /* @__PURE__ */ jsx("path", { d: "M3 18h18" })]
								}),
								item.bedrooms,
								" hab."
							]
						}),
						item.bathrooms != null && /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-[0.65rem]",
							style: { color: "var(--ink-2)" },
							children: [
								/* @__PURE__ */ jsxs("svg", {
									className: "h-3 w-3 shrink-0",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									children: [
										/* @__PURE__ */ jsx("path", { d: "M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" }),
										/* @__PURE__ */ jsx("line", {
											x1: "10",
											y1: "5",
											x2: "8",
											y2: "7"
										}),
										/* @__PURE__ */ jsx("line", {
											x1: "2",
											y1: "12",
											x2: "22",
											y2: "12"
										})
									]
								}),
								item.bathrooms,
								" baños"
							]
						}),
						item.areaSqm != null && /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-[0.65rem]",
							style: { color: "var(--ink-2)" },
							children: [
								/* @__PURE__ */ jsx("svg", {
									className: "h-3 w-3 shrink-0",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									children: /* @__PURE__ */ jsx("rect", {
										x: "3",
										y: "3",
										width: "18",
										height: "18",
										rx: "1"
									})
								}),
								item.areaSqm,
								" m²"
							]
						})
					]
				}),
				item.category === "service" && item.responseTime && /* @__PURE__ */ jsx("div", {
					className: "mb-2.5",
					children: /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1 text-[0.65rem]",
						style: { color: "var(--ink-2)" },
						children: [
							/* @__PURE__ */ jsxs("svg", {
								className: "h-3 w-3 shrink-0",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								children: [/* @__PURE__ */ jsx("circle", {
									cx: "12",
									cy: "12",
									r: "10"
								}), /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })]
							}),
							"Responde en ",
							item.responseTime
						]
					})
				}),
				item.category === "experience" && /* @__PURE__ */ jsxs("div", {
					className: "mb-2.5 flex flex-wrap gap-x-2.5 gap-y-1",
					children: [item.durationHours != null && /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1 text-[0.65rem]",
						style: { color: "var(--ink-2)" },
						children: [
							/* @__PURE__ */ jsxs("svg", {
								className: "h-3 w-3 shrink-0",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								children: [/* @__PURE__ */ jsx("circle", {
									cx: "12",
									cy: "12",
									r: "10"
								}), /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })]
							}),
							item.durationHours,
							"h"
						]
					}), item.maxGuests != null && /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1 text-[0.65rem]",
						style: { color: "var(--ink-2)" },
						children: [
							/* @__PURE__ */ jsxs("svg", {
								className: "h-3 w-3 shrink-0",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								children: [
									/* @__PURE__ */ jsx("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
									/* @__PURE__ */ jsx("circle", {
										cx: "9",
										cy: "7",
										r: "4"
									}),
									/* @__PURE__ */ jsx("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
									/* @__PURE__ */ jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
								]
							}),
							"Máx. ",
							item.maxGuests
						]
					})]
				}),
				/* @__PURE__ */ jsxs(Button, {
					onClick: handleNavigate,
					className: "h-8 w-full gap-1.5 rounded-lg text-xs font-medium",
					children: [t("common.viewDetail", "Ver detalle"), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })]
				}),
				item.scrapedSource && /* @__PURE__ */ jsxs("a", {
					href: item.scrapedSourceUrl ?? "#",
					target: "_blank",
					rel: "noopener noreferrer",
					onClick: (e) => e.stopPropagation(),
					className: "mt-1.5 flex items-center gap-1 text-[0.6rem] font-medium underline-offset-2 hover:underline",
					style: { color: SOURCE_COLORS[item.scrapedSource] ?? "var(--ink-3)" },
					children: [/* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" }), SOURCE_LABELS[item.scrapedSource] ?? item.scrapedSource]
				})
			]
		})]
	});
	if (variant === "compact") return /* @__PURE__ */ jsxs(m.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		transition: { duration: .3 },
		className: "group cursor-pointer",
		onClick: handleCardClick,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative mb-2.5 aspect-[3/4] overflow-hidden rounded-xl bg-(--surface-3)",
			children: [
				/* @__PURE__ */ jsx("img", {
					src: item.coverUrl ?? PLACEHOLDER,
					alt: "",
					className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
					loading: "lazy",
					onError: handleImgError
				}),
				item.featured && /* @__PURE__ */ jsx("div", {
					className: "absolute left-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[0.58rem] font-semibold text-white backdrop-blur-sm",
					children: "★ Featured"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2.5 pb-2 pt-6",
					children: /* @__PURE__ */ jsx("span", {
						className: "rounded-full px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wider text-white",
						style: { backgroundColor: accent },
						children: item.transactionType
					})
				}),
				onFavorite && /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "icon-sm",
					onClick: (e) => {
						e.stopPropagation();
						onFavorite();
					},
					className: "absolute right-2 top-2 rounded-full p-1 active:scale-90",
					"aria-label": isFavorite ? "Remove from favorites" : "Save to favorites",
					children: /* @__PURE__ */ jsx(Heart, {
						className: `h-4.5 w-4.5 drop-shadow transition-colors ${isFavorite ? "fill-(--red) stroke-(--red)" : "fill-black/30 stroke-white"}`,
						strokeWidth: 1.5
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "absolute right-10 top-2",
					onClick: (e) => e.stopPropagation(),
					children: /* @__PURE__ */ jsx(ShareMenu, {
						url: typeof window !== "undefined" ? `${window.location.origin}/listing/${item.slug}` : void 0,
						title: item.title,
						text: item.summary ?? void 0,
						className: "h-7 w-7 rounded-full bg-black/30 p-0 text-white drop-shadow hover:bg-black/50 hover:text-white active:scale-90",
						buttonStyle: { color: "white" },
						ariaLabel: t("share.label", "Share")
					})
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "space-y-0.5",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "truncate text-sm font-medium leading-snug text-foreground",
					children: item.title
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "text-sm font-semibold tabular-nums text-foreground",
					children: [formattedPrice, priceSuffix && /* @__PURE__ */ jsx("span", {
						className: "text-xs font-normal",
						style: { color: "var(--ink-3)" },
						children: priceSuffix
					})]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "truncate text-xs",
					style: { color: "var(--ink-3)" },
					children: [item.city, item.neighborhood ? ` · ${item.neighborhood}` : ""]
				}),
				item.scrapedSource && /* @__PURE__ */ jsxs("a", {
					href: item.scrapedSourceUrl ?? "#",
					target: "_blank",
					rel: "noopener noreferrer",
					onClick: (e) => e.stopPropagation(),
					className: "mt-1 flex items-center gap-1 text-[0.6rem] font-medium underline-offset-2 hover:underline",
					style: { color: SOURCE_COLORS[item.scrapedSource] ?? "var(--ink-3)" },
					children: [/* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" }), SOURCE_LABELS[item.scrapedSource] ?? item.scrapedSource]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap gap-1 pt-1",
					children: [
						item.category === "vehicle" && /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("span", {
								className: "rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)",
								children: item.year
							}),
							item.mileageKm != null && /* @__PURE__ */ jsxs("span", {
								className: "rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)",
								children: [(item.mileageKm / 1e3).toFixed(0), "k km"]
							}),
							item.fuelType && /* @__PURE__ */ jsx("span", {
								className: "rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)",
								children: item.fuelType
							}),
							item.transmission && /* @__PURE__ */ jsx("span", {
								className: "rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)",
								children: item.transmission
							})
						] }),
						item.category === "property" && /* @__PURE__ */ jsxs(Fragment, { children: [
							item.bedrooms != null && /* @__PURE__ */ jsxs("span", {
								className: "rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)",
								children: [item.bedrooms, " hab."]
							}),
							item.bathrooms != null && /* @__PURE__ */ jsxs("span", {
								className: "rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)",
								children: [item.bathrooms, " baños"]
							}),
							item.areaSqm != null && /* @__PURE__ */ jsxs("span", {
								className: "rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)",
								children: [item.areaSqm, " m²"]
							})
						] }),
						item.category === "service" && /* @__PURE__ */ jsx(ServiceCardMetrics, { item }),
						item.category === "experience" && /* @__PURE__ */ jsx(ExperienceCardMetrics, { item })
					]
				})
			]
		})]
	});
	return /* @__PURE__ */ jsxs(m.div, {
		initial: {
			opacity: 0,
			y: 8
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .3,
			ease: EDITORIAL_EASE
		},
		className: `group relative flex cursor-pointer gap-4 border-b p-4 transition-colors ${isActive ? "bg-(--surface-2)" : "hover:bg-(--surface-2)"}`,
		style: {
			borderColor: "var(--line-1)",
			borderLeftWidth: isActive ? "2px" : "0",
			borderLeftColor: isActive ? "var(--amber)" : "transparent",
			borderLeftStyle: "solid",
			paddingLeft: isActive ? "calc(1rem - 2px)" : "1rem"
		},
		onClick: handleCardClick,
		children: [/* @__PURE__ */ jsx("div", {
			className: "relative h-28 w-28 shrink-0 overflow-hidden bg-(--surface-2) sm:h-32 sm:w-36",
			children: /* @__PURE__ */ jsx("img", {
				src: item.coverUrl ?? PLACEHOLDER,
				alt: "",
				className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]",
				loading: "lazy",
				onError: handleImgError
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "mb-1.5 flex items-center gap-2 text-[0.6875rem]",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "meta-label",
										style: { color: accent },
										children: item.transactionType
									}),
									/* @__PURE__ */ jsx("span", {
										className: "meta-label",
										style: { color: "var(--ink-4)" },
										children: "·"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "meta-label",
										style: { color: "var(--ink-3)" },
										children: item.subCategory
									})
								]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-display text-base font-medium leading-[1.2] tracking-[-0.015em] text-foreground line-clamp-2 sm:text-lg",
								children: item.title
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-xs",
								style: { color: "var(--ink-3)" },
								children: [item.city, item.neighborhood ? ` · ${item.neighborhood}` : ""]
							})
						]
					}), onFavorite && /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon-sm",
						onClick: (e) => {
							e.stopPropagation();
							onFavorite();
						},
						className: "shrink-0 rounded-full p-1 active:scale-90",
						children: /* @__PURE__ */ jsx(Heart, {
							className: `h-4 w-4 transition-colors ${isFavorite ? "fill-(--red) text-(--red)" : ""}`,
							style: !isFavorite ? { color: "var(--ink-3)" } : void 0,
							strokeWidth: 1.5
						})
					})]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mt-2.5 font-sans text-base font-medium tabular-nums text-foreground sm:text-lg",
					children: [formattedPrice, priceSuffix && /* @__PURE__ */ jsx("span", {
						className: "text-xs font-normal",
						style: { color: "var(--ink-3)" },
						children: priceSuffix
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-2",
					children: [
						item.category === "property" && /* @__PURE__ */ jsx(PropertyCardMetrics, { item }),
						item.category === "vehicle" && /* @__PURE__ */ jsx(VehicleCardMetrics, { item }),
						item.category === "service" && /* @__PURE__ */ jsx(ServiceCardMetrics, { item }),
						item.category === "experience" && /* @__PURE__ */ jsx(ExperienceCardMetrics, { item })
					]
				}),
				/* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					size: "xs",
					onClick: handleNavigate,
					className: "mt-2 h-auto gap-1 px-0 py-0 text-xs font-medium",
					style: { color: "var(--ink-3)" },
					onMouseEnter: (e) => e.currentTarget.style.color = "var(--ink-1)",
					onMouseLeave: (e) => e.currentTarget.style.color = "var(--ink-3)",
					children: [t("common.viewDetail", "Ver"), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })]
				}),
				item.scrapedSource && /* @__PURE__ */ jsxs("a", {
					href: item.scrapedSourceUrl ?? "#",
					target: "_blank",
					rel: "noopener noreferrer",
					onClick: (e) => e.stopPropagation(),
					className: "mt-1 flex items-center gap-1 text-[0.6rem] font-medium underline-offset-2 hover:underline",
					style: { color: SOURCE_COLORS[item.scrapedSource] ?? "var(--ink-3)" },
					children: [/* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" }), SOURCE_LABELS[item.scrapedSource] ?? item.scrapedSource]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/ui/toggle.tsx
var toggleVariants = cva("inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-transparent",
			outline: "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground"
		},
		size: {
			default: "h-9 min-w-9 px-2",
			sm: "h-8 min-w-8 px-1.5",
			lg: "h-10 min-w-10 px-2.5"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Toggle$1({ className, variant, size, ...props }) {
	return /* @__PURE__ */ jsx(Toggle.Root, {
		"data-slot": "toggle",
		className: cn(toggleVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
//#region src/components/ui/toggle-group.tsx
var ToggleGroupContext = React$1.createContext({
	size: "default",
	variant: "default",
	spacing: 0
});
function ToggleGroup$1({ className, variant, size, spacing = 0, children, ...props }) {
	return /* @__PURE__ */ jsx(ToggleGroup.Root, {
		"data-slot": "toggle-group",
		"data-variant": variant,
		"data-size": size,
		"data-spacing": spacing,
		style: { "--gap": spacing },
		className: cn("group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs", className),
		...props,
		children: /* @__PURE__ */ jsx(ToggleGroupContext.Provider, {
			value: {
				variant,
				size,
				spacing
			},
			children
		})
	});
}
function ToggleGroupItem({ className, children, variant, size, ...props }) {
	const context = React$1.useContext(ToggleGroupContext);
	return /* @__PURE__ */ jsx(ToggleGroup.Item, {
		"data-slot": "toggle-group-item",
		"data-variant": context.variant || variant,
		"data-size": context.size || size,
		"data-spacing": context.spacing,
		className: cn(toggleVariants({
			variant: context.variant || variant,
			size: context.size || size
		}), "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10", "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l", className),
		...props,
		children
	});
}
//#endregion
//#region src/modules/map/ui/MapToolbar.tsx
var RADIUS_PRESETS = [
	1,
	5,
	10,
	25,
	50
];
function MapToolbar({ drawMode, area, onNearMe, onStartRadius, onStartPolygon, onClear, onRadiusChange, styleSlot }) {
	const { t } = useTranslation();
	const hasArea = area !== null;
	return /* @__PURE__ */ jsxs(TooltipProvider, {
		delayDuration: 300,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "pointer-events-auto absolute left-3 top-3 z-10 flex flex-col items-start gap-2",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm",
				children: [
					/* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ jsxs(Button, {
							type: "button",
							size: "sm",
							variant: "ghost",
							onClick: onNearMe,
							className: "h-8 gap-1.5 px-2.5",
							"aria-label": t("map.nearMe", "Near me"),
							children: [/* @__PURE__ */ jsx(MapPin, {
								className: "h-3.5 w-3.5",
								strokeWidth: 1.75
							}), /* @__PURE__ */ jsx("span", {
								className: "hidden md:inline text-xs",
								children: t("map.nearMe", "Near me")
							})]
						})
					}), /* @__PURE__ */ jsx(TooltipContent, {
						side: "bottom",
						children: t("map.nearMeHint", "Use my current location")
					})] }),
					/* @__PURE__ */ jsx(Separator$1, {
						orientation: "vertical",
						className: "h-6"
					}),
					/* @__PURE__ */ jsxs(ToggleGroup$1, {
						type: "single",
						value: drawMode === "none" ? "" : drawMode,
						onValueChange: (v) => {
							if (v === "radius") onStartRadius();
							else if (v === "polygon") onStartPolygon();
							else if (drawMode !== "none") if (drawMode === "radius") onStartRadius();
							else onStartPolygon();
						},
						className: "gap-1",
						children: [/* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
							asChild: true,
							children: /* @__PURE__ */ jsxs(ToggleGroupItem, {
								value: "radius",
								size: "sm",
								className: "h-8 gap-1.5 px-2.5 hover:bg-accent hover:text-accent-foreground",
								"aria-label": t("map.radius", "Radius"),
								children: [/* @__PURE__ */ jsx(Compass, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.75
								}), /* @__PURE__ */ jsx("span", {
									className: "hidden md:inline text-xs",
									children: t("map.radius", "Radius")
								})]
							})
						}), /* @__PURE__ */ jsx(TooltipContent, {
							side: "bottom",
							children: t("map.drawRadius", "Draw a radius")
						})] }), /* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
							asChild: true,
							children: /* @__PURE__ */ jsxs(ToggleGroupItem, {
								value: "polygon",
								size: "sm",
								className: "h-8 gap-1.5 px-2.5 hover:bg-accent hover:text-accent-foreground",
								"aria-label": t("map.area", "Area"),
								children: [/* @__PURE__ */ jsx(Hexagon, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.75
								}), /* @__PURE__ */ jsx("span", {
									className: "hidden md:inline text-xs",
									children: t("map.area", "Area")
								})]
							})
						}), /* @__PURE__ */ jsx(TooltipContent, {
							side: "bottom",
							children: t("map.drawArea", "Draw a polygon")
						})] })]
					}),
					styleSlot && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Separator$1, {
						orientation: "vertical",
						className: "h-6"
					}), styleSlot] })
				]
			}), hasArea && /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-2 rounded-md border border-(--amber)/60 bg-background/95 p-2 shadow-sm backdrop-blur-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsxs(Badge, {
						variant: "secondary",
						className: "gap-1 bg-(--amber)/15 text-(--amber-ink) hover:bg-(--amber)/20",
						children: [area.type === "radius" ? /* @__PURE__ */ jsx(Compass, {
							className: "h-3 w-3",
							strokeWidth: 2
						}) : /* @__PURE__ */ jsx(Hexagon, {
							className: "h-3 w-3",
							strokeWidth: 2
						}), /* @__PURE__ */ jsx("span", {
							className: "tabular-nums",
							children: area.type === "radius" ? t("map.radiusLabel", "{{km}} km", { km: area.radiusKm }) : t("map.polygonLabel", "{{n}} vertices", { n: area.vertices })
						})]
					}), /* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ jsx(Button, {
							type: "button",
							size: "icon",
							variant: "ghost",
							onClick: onClear,
							className: "ml-auto h-6 w-6 text-muted-foreground hover:text-destructive",
							"aria-label": t("map.clearArea", "Clear area"),
							children: /* @__PURE__ */ jsx(X, {
								className: "h-3.5 w-3.5",
								strokeWidth: 1.75
							})
						})
					}), /* @__PURE__ */ jsx(TooltipContent, {
						side: "bottom",
						children: t("map.clearArea", "Clear area")
					})] })]
				}), area.type === "radius" && onRadiusChange && /* @__PURE__ */ jsxs(ToggleGroup$1, {
					type: "single",
					value: RADIUS_PRESETS.find((km) => Math.abs(area.radiusKm - km) < .01)?.toString() ?? "",
					onValueChange: (v) => v && onRadiusChange(Number(v)),
					className: "gap-0.5",
					children: [RADIUS_PRESETS.map((km) => /* @__PURE__ */ jsx(ToggleGroupItem, {
						value: km.toString(),
						size: "sm",
						className: "h-6 min-w-8 px-1.5 text-[10px] font-semibold tabular-nums hover:bg-accent hover:text-accent-foreground",
						"aria-label": `${km} km`,
						children: km
					}, km)), /* @__PURE__ */ jsx("span", {
						className: "ml-1 self-center text-[10px] text-muted-foreground",
						children: "km"
					})]
				})]
			})]
		}), drawMode !== "none" && /* @__PURE__ */ jsx("div", {
			className: "pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2",
			children: /* @__PURE__ */ jsxs(Badge, {
				variant: "outline",
				className: cn("gap-2 rounded-full border-(--amber)/60 bg-background/95 px-3.5 py-1.5 text-[11px] font-medium shadow-md backdrop-blur-sm"),
				children: [/* @__PURE__ */ jsx(MousePointerClick, {
					className: "h-3.5 w-3.5 text-(--amber-ink)",
					strokeWidth: 1.75
				}), drawMode === "radius" ? t("map.radiusHint", "Click the map to set the center") : t("map.polygonHint", "Click to add points · double-click to finish")]
			})
		})]
	});
}
//#endregion
//#region src/components/ui/popover.tsx
function Popover$1({ ...props }) {
	return /* @__PURE__ */ jsx(Popover.Root, {
		"data-slot": "popover",
		...props
	});
}
function PopoverTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(Popover.Trigger, {
		"data-slot": "popover-trigger",
		...props
	});
}
function PopoverContent({ className, align = "center", sideOffset = 4, ...props }) {
	return /* @__PURE__ */ jsx(Popover.Portal, { children: /* @__PURE__ */ jsx(Popover.Content, {
		"data-slot": "popover-content",
		align,
		sideOffset,
		className: cn("z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", className),
		...props
	}) });
}
//#endregion
//#region src/modules/map/ui/map-styles.ts
/**
* Free tile providers — none require an API key.
*  - OpenFreeMap (liberty / positron / bright / dark) — vector, community-hosted
*  - Esri World Imagery — raster satellite, free with attribution
*/
var MAP_STYLES = [
	{
		id: "liberty",
		label: "Streets",
		style: "https://tiles.openfreemap.org/styles/liberty",
		preview: "https://tiles.openfreemap.org/1/0/0.png"
	},
	{
		id: "positron",
		label: "Light",
		style: "https://tiles.openfreemap.org/styles/positron",
		preview: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/1/0/0.png"
	},
	{
		id: "bright",
		label: "Bright",
		style: "https://tiles.openfreemap.org/styles/bright",
		preview: "https://tile.openstreetmap.org/1/0/0.png"
	},
	{
		id: "dark",
		label: "Dark",
		style: "https://tiles.openfreemap.org/styles/dark",
		preview: "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/1/0/0.png"
	},
	{
		id: "satellite",
		label: "Satellite",
		style: {
			version: 8,
			sources: { "esri-imagery": {
				type: "raster",
				tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
				tileSize: 256,
				attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
				maxzoom: 19
			} },
			layers: [{
				id: "esri-imagery",
				type: "raster",
				source: "esri-imagery"
			}],
			glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf"
		},
		preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/1/0/0"
	}
];
var STORAGE_KEY = "geo-dashboard.mapStyle";
function getMapStyle(id) {
	return MAP_STYLES.find((s) => s.id === id) ?? MAP_STYLES[0];
}
/** Default style for the current app theme (used when user hasn't picked one). */
function themeDefaultStyle(resolved) {
	return resolved === "dark" ? "dark" : "bright";
}
/** Returns the user's explicit choice, or null if they never picked one. */
function readPersistedStyle() {
	if (typeof window === "undefined") return null;
	const saved = window.localStorage.getItem(STORAGE_KEY);
	if (saved && MAP_STYLES.some((s) => s.id === saved)) return saved;
	return null;
}
function persistStyle(id) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, id);
	} catch {}
}
//#endregion
//#region src/modules/map/ui/MapStyleSwitcher.tsx
/**
* Icon-only basemap switcher designed to live INSIDE MapToolbar's pill
* (no outer chrome of its own). The parent provides the border + background.
*/
function MapStyleSwitcher({ value, onChange, tooltipSide = "bottom", popoverSide = "bottom" }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsx(TooltipProvider, {
		delayDuration: 300,
		children: /* @__PURE__ */ jsxs(Popover$1, { children: [/* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsx(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ jsxs(Button, {
					type: "button",
					size: "sm",
					variant: "ghost",
					className: "h-8 gap-1.5 px-2.5 hover:bg-accent hover:text-accent-foreground",
					"aria-label": t("map.layers", "Layers"),
					children: [/* @__PURE__ */ jsx(Layers, {
						className: "h-3.5 w-3.5",
						strokeWidth: 1.75
					}), /* @__PURE__ */ jsx("span", {
						className: "hidden md:inline text-xs",
						children: t("map.layers", "Layers")
					})]
				})
			})
		}), /* @__PURE__ */ jsx(TooltipContent, {
			side: tooltipSide,
			children: t("map.style", "Map style")
		})] }), /* @__PURE__ */ jsxs(PopoverContent, {
			side: popoverSide,
			align: "start",
			sideOffset: 8,
			className: "w-56 p-2",
			children: [/* @__PURE__ */ jsx("div", {
				className: "mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
				children: t("map.basemap", "Basemap")
			}), /* @__PURE__ */ jsx("ul", {
				className: "grid grid-cols-2 gap-2",
				children: MAP_STYLES.map((s) => {
					const active = s.id === value;
					return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => onChange(s.id),
						className: cn("group relative flex w-full flex-col overflow-hidden rounded-md border bg-background text-left transition-colors", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"),
						"aria-pressed": active,
						"aria-label": s.label,
						children: [/* @__PURE__ */ jsx("div", {
							className: "h-14 w-full bg-muted bg-cover bg-center",
							style: { backgroundImage: `url("${s.preview}")` }
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between px-2 py-1.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium",
								children: t(`map.styles.${s.id}`, s.label)
							}), active && /* @__PURE__ */ jsx(Check, {
								className: "h-3.5 w-3.5 text-primary",
								strokeWidth: 2.25
							})]
						})]
					}) }, s.id);
				})
			})]
		})] })
	});
}
//#endregion
//#region src/modules/map/ui/MapNavControls.tsx
/**
* Vertical pill of map navigation controls. Shares the exact chrome of
* MapToolbar / MapStyleSwitcher so all three feel like one family:
*   rounded-md + border + bg-background/95 + shadow-sm + backdrop-blur-sm + p-1
* Buttons are ghost, h-8 w-8, icon 3.5 with strokeWidth 1.75.
*/
function MapNavControls({ bearing, onZoomIn, onZoomOut, onResetNorth, onGeolocate }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsx(TooltipProvider, {
		delayDuration: 300,
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm",
			children: [
				/* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						type: "button",
						size: "icon",
						variant: "ghost",
						onClick: onZoomIn,
						className: "h-8 w-8 hover:bg-accent hover:text-accent-foreground",
						"aria-label": t("map.zoomIn", "Zoom in"),
						children: /* @__PURE__ */ jsx(Plus, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.75
						})
					})
				}), /* @__PURE__ */ jsx(TooltipContent, {
					side: "left",
					children: t("map.zoomIn", "Zoom in")
				})] }),
				/* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						type: "button",
						size: "icon",
						variant: "ghost",
						onClick: onZoomOut,
						className: "h-8 w-8 hover:bg-accent hover:text-accent-foreground",
						"aria-label": t("map.zoomOut", "Zoom out"),
						children: /* @__PURE__ */ jsx(Minus, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.75
						})
					})
				}), /* @__PURE__ */ jsx(TooltipContent, {
					side: "left",
					children: t("map.zoomOut", "Zoom out")
				})] }),
				/* @__PURE__ */ jsx(Separator$1, {
					orientation: "horizontal",
					className: "w-6"
				}),
				/* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						type: "button",
						size: "icon",
						variant: "ghost",
						onClick: onResetNorth,
						className: "h-8 w-8 hover:bg-accent hover:text-accent-foreground",
						"aria-label": t("map.resetNorth", "Reset north"),
						children: /* @__PURE__ */ jsx(Compass, {
							className: "h-3.5 w-3.5 transition-transform duration-200",
							strokeWidth: 1.75,
							style: { transform: `rotate(${-bearing}deg)` }
						})
					})
				}), /* @__PURE__ */ jsx(TooltipContent, {
					side: "left",
					children: t("map.resetNorth", "Reset north")
				})] }),
				/* @__PURE__ */ jsx(Separator$1, {
					orientation: "horizontal",
					className: "w-6"
				}),
				/* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						type: "button",
						size: "icon",
						variant: "ghost",
						onClick: onGeolocate,
						className: "h-8 w-8 hover:bg-accent hover:text-accent-foreground",
						"aria-label": t("map.geolocate", "My location"),
						children: /* @__PURE__ */ jsx(LocateFixed, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.75
						})
					})
				}), /* @__PURE__ */ jsx(TooltipContent, {
					side: "left",
					children: t("map.geolocate", "My location")
				})] })
			]
		})
	});
}
//#endregion
//#region src/modules/map/ui/MapView.tsx
var DEFAULT_CENTER = [12.5683, 55.6761];
var DEFAULT_ZOOM = 12;
var SOURCE_ID = "geo-listings";
var CLUSTER_LAYER = "geo-clusters";
var CLUSTER_COUNT_LAYER = "geo-cluster-count";
var UNCLUSTERED_LAYER = "geo-unclustered";
var UNCLUSTERED_LABEL_LAYER = "geo-unclustered-label";
var AREA_SOURCE = "geo-area";
var AREA_FILL_LAYER = "geo-area-fill";
var AREA_LINE_LAYER = "geo-area-line";
var AREA_DRAFT_SOURCE = "geo-area-draft";
var AREA_DRAFT_LINE = "geo-area-draft-line";
var AREA_DRAFT_POINTS = "geo-area-draft-points";
var USER_LOC_SOURCE = "geo-user-location";
var USER_LOC_ACCURACY = "geo-user-location-accuracy";
var USER_LOC_HALO = "geo-user-location-halo";
var USER_LOC_DOT = "geo-user-location-dot";
var CATEGORY_COLORS = {
	property: "#2563eb",
	vehicle: "#059669",
	service: "#d97706",
	experience: "#9333ea"
};
/** Approximate circle as a polygon ring (64 points) for GeoJSON rendering. */
function circleToPolygon(lng, lat, radiusKm, steps = 64) {
	const coords = [];
	const latR = lat * Math.PI / 180;
	const kmPerDegLat = 111.32;
	const kmPerDegLng = 111.32 * Math.cos(latR);
	for (let i = 0; i <= steps; i++) {
		const theta = i / steps * 2 * Math.PI;
		const dLat = radiusKm * Math.sin(theta) / kmPerDegLat;
		const dLng = radiusKm * Math.cos(theta) / Math.max(kmPerDegLng, .01);
		coords.push([lng + dLng, lat + dLat]);
	}
	return coords;
}
function areaToGeoJSON(area) {
	if (!area) return {
		type: "FeatureCollection",
		features: []
	};
	if (area.type === "radius") return {
		type: "FeatureCollection",
		features: [{
			type: "Feature",
			geometry: {
				type: "Polygon",
				coordinates: [circleToPolygon(area.lng, area.lat, area.radiusKm)]
			},
			properties: {}
		}]
	};
	const ring = [...area.ring];
	if (ring.length > 0) {
		const [fx, fy] = ring[0];
		const [lx, ly] = ring[ring.length - 1];
		if (fx !== lx || fy !== ly) ring.push([fx, fy]);
	}
	return {
		type: "FeatureCollection",
		features: [{
			type: "Feature",
			geometry: {
				type: "Polygon",
				coordinates: [ring]
			},
			properties: {}
		}]
	};
}
/** Update the polygon draft source with the current vertex list. */
function updateDraft(map, points) {
	const src = map.getSource(AREA_DRAFT_SOURCE);
	if (!src) return;
	const features = [];
	for (const p of points) features.push({
		type: "Feature",
		geometry: {
			type: "Point",
			coordinates: p
		},
		properties: {}
	});
	if (points.length >= 2) features.push({
		type: "Feature",
		geometry: {
			type: "LineString",
			coordinates: points
		},
		properties: {}
	});
	src.setData({
		type: "FeatureCollection",
		features
	});
}
function formatMarkerPrice(price) {
	if (price >= 1e6) return `${(price / 1e6).toFixed(1)}M`;
	if (price >= 1e3) return `${(price / 1e3).toFixed(0)}K`;
	return price.toString();
}
function markersToGeoJSON(markers) {
	return {
		type: "FeatureCollection",
		features: markers.map((m) => ({
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [m.longitude, m.latitude]
			},
			properties: {
				id: m.id,
				slug: m.slug,
				category: m.category,
				price: m.price,
				priceLabel: formatMarkerPrice(m.price)
			}
		}))
	};
}
function MapView({ markers, items, activeId, onSelect, onBoundsChange, center, zoom, area = null, onAreaChange, defaultRadiusKm = 5, hideToolbar = false, hideNavControls = false, interactive = true }) {
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	const popupRef = useRef(null);
	const popupContainerRef = useRef(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [popupItem, setPopupItem] = useState(null);
	const [bearing, setBearing] = useState(0);
	const [drawMode, setDrawMode] = useState("none");
	const drawModeRef = useRef("none");
	const draftPointsRef = useRef([]);
	const userPulseRafRef = useRef(null);
	const { resolvedTheme } = useTheme();
	const [userStyle, setUserStyle] = useState(() => readPersistedStyle());
	const styleId = userStyle ?? themeDefaultStyle(resolvedTheme);
	const styleIdRef = useRef(styleId);
	useEffect(() => {
		styleIdRef.current = styleId;
	}, [styleId]);
	const setupOverlayRef = useRef(null);
	const handleStyleChange = useCallback((id) => {
		setUserStyle(id);
		persistStyle(id);
	}, []);
	const onSelectRef = useRef(onSelect);
	const onBoundsChangeRef = useRef(onBoundsChange);
	const onAreaChangeRef = useRef(onAreaChange);
	const defaultRadiusRef = useRef(defaultRadiusKm);
	useEffect(() => {
		onSelectRef.current = onSelect;
	}, [onSelect]);
	useEffect(() => {
		onBoundsChangeRef.current = onBoundsChange;
	}, [onBoundsChange]);
	useEffect(() => {
		onAreaChangeRef.current = onAreaChange;
	}, [onAreaChange]);
	useEffect(() => {
		defaultRadiusRef.current = defaultRadiusKm;
	}, [defaultRadiusKm]);
	useEffect(() => {
		drawModeRef.current = drawMode;
	}, [drawMode]);
	useEffect(() => {
		if (!containerRef.current || mapRef.current) return;
		const map = new maplibregl.Map({
			container: containerRef.current,
			style: getMapStyle(styleIdRef.current).style,
			center: center ?? DEFAULT_CENTER,
			zoom: zoom ?? DEFAULT_ZOOM,
			interactive,
			attributionControl: false
		});
		map.on("rotate", () => setBearing(map.getBearing()));
		map.on("rotateend", () => setBearing(map.getBearing()));
		/** Idempotent: adds all custom sources+layers. Safe to call on load AND after setStyle. */
		const setupOverlayLayers = () => {
			if (map.getSource(AREA_SOURCE)) return;
			map.addSource(AREA_SOURCE, {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: []
				}
			});
			map.addLayer({
				id: AREA_FILL_LAYER,
				type: "fill",
				source: AREA_SOURCE,
				paint: {
					"fill-color": "#f59e0b",
					"fill-opacity": .12
				}
			});
			map.addLayer({
				id: AREA_LINE_LAYER,
				type: "line",
				source: AREA_SOURCE,
				paint: {
					"line-color": "#f59e0b",
					"line-width": 2,
					"line-dasharray": [2, 1]
				}
			});
			map.addSource(AREA_DRAFT_SOURCE, {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: []
				}
			});
			map.addLayer({
				id: AREA_DRAFT_LINE,
				type: "line",
				source: AREA_DRAFT_SOURCE,
				filter: [
					"==",
					"$type",
					"LineString"
				],
				paint: {
					"line-color": "#f59e0b",
					"line-width": 2,
					"line-dasharray": [1, 1]
				}
			});
			map.addLayer({
				id: AREA_DRAFT_POINTS,
				type: "circle",
				source: AREA_DRAFT_SOURCE,
				filter: [
					"==",
					"$type",
					"Point"
				],
				paint: {
					"circle-color": "#f59e0b",
					"circle-radius": 4,
					"circle-stroke-color": "#ffffff",
					"circle-stroke-width": 2
				}
			});
			map.addSource(USER_LOC_SOURCE, {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: []
				}
			});
			map.addLayer({
				id: USER_LOC_ACCURACY,
				type: "circle",
				source: USER_LOC_SOURCE,
				filter: [
					"==",
					"$type",
					"Point"
				],
				paint: {
					"circle-color": "#2563eb",
					"circle-opacity": .12,
					"circle-radius": [
						"interpolate",
						["linear"],
						["zoom"],
						10,
						[
							"/",
							[
								"coalesce",
								["get", "accuracy"],
								50
							],
							20
						],
						16,
						[
							"/",
							[
								"coalesce",
								["get", "accuracy"],
								50
							],
							2
						]
					],
					"circle-stroke-color": "#2563eb",
					"circle-stroke-opacity": .3,
					"circle-stroke-width": 1
				}
			});
			map.addLayer({
				id: USER_LOC_HALO,
				type: "circle",
				source: USER_LOC_SOURCE,
				paint: {
					"circle-color": "#2563eb",
					"circle-opacity": .25,
					"circle-radius": 14,
					"circle-blur": .6
				}
			});
			map.addLayer({
				id: USER_LOC_DOT,
				type: "circle",
				source: USER_LOC_SOURCE,
				paint: {
					"circle-color": "#2563eb",
					"circle-radius": 6,
					"circle-stroke-color": "#ffffff",
					"circle-stroke-width": 2.5
				}
			});
			map.addSource(SOURCE_ID, {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: []
				},
				cluster: true,
				clusterMaxZoom: 14,
				clusterRadius: 50
			});
			map.addLayer({
				id: CLUSTER_LAYER,
				type: "circle",
				source: SOURCE_ID,
				filter: ["has", "point_count"],
				paint: {
					"circle-color": [
						"step",
						["get", "point_count"],
						"#93c5fd",
						10,
						"#60a5fa",
						50,
						"#3b82f6",
						200,
						"#1d4ed8"
					],
					"circle-radius": [
						"step",
						["get", "point_count"],
						18,
						10,
						22,
						50,
						28,
						200,
						34
					],
					"circle-stroke-width": 2,
					"circle-stroke-color": "#ffffff"
				}
			});
			map.addLayer({
				id: CLUSTER_COUNT_LAYER,
				type: "symbol",
				source: SOURCE_ID,
				filter: ["has", "point_count"],
				layout: {
					"text-field": ["get", "point_count_abbreviated"],
					"text-font": ["Noto Sans Bold"],
					"text-size": 13
				},
				paint: { "text-color": "#ffffff" }
			});
			map.addLayer({
				id: UNCLUSTERED_LAYER,
				type: "circle",
				source: SOURCE_ID,
				filter: ["!", ["has", "point_count"]],
				paint: {
					"circle-color": [
						"match",
						["get", "category"],
						"property",
						CATEGORY_COLORS.property,
						"vehicle",
						CATEGORY_COLORS.vehicle,
						"service",
						CATEGORY_COLORS.service,
						"experience",
						CATEGORY_COLORS.experience,
						"#6b7280"
					],
					"circle-radius": 14,
					"circle-stroke-width": 2,
					"circle-stroke-color": "#ffffff"
				}
			});
			map.addLayer({
				id: UNCLUSTERED_LABEL_LAYER,
				type: "symbol",
				source: SOURCE_ID,
				filter: ["!", ["has", "point_count"]],
				layout: {
					"text-field": ["get", "priceLabel"],
					"text-font": ["Noto Sans Bold"],
					"text-size": 10,
					"text-allow-overlap": false
				},
				paint: { "text-color": "#ffffff" }
			});
		};
		setupOverlayRef.current = setupOverlayLayers;
		map.on("load", () => {
			setupOverlayLayers();
			map.on("click", CLUSTER_LAYER, async (e) => {
				const feat = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] })[0];
				if (!feat) return;
				const clusterId = feat.properties?.cluster_id;
				const src = map.getSource(SOURCE_ID);
				if (!src || clusterId == null) return;
				try {
					const expansionZoom = await src.getClusterExpansionZoom(clusterId);
					map.easeTo({
						center: feat.geometry.coordinates,
						zoom: expansionZoom,
						duration: 500
					});
				} catch {}
			});
			map.on("click", UNCLUSTERED_LAYER, (e) => {
				const feat = e.features?.[0];
				if (!feat) return;
				const id = feat.properties?.id;
				if (id) onSelectRef.current?.(id);
			});
			map.on("click", (e) => {
				const mode = drawModeRef.current;
				if (mode === "none") return;
				if (mode === "radius") {
					onAreaChangeRef.current?.({
						type: "radius",
						lng: e.lngLat.lng,
						lat: e.lngLat.lat,
						radiusKm: defaultRadiusRef.current
					});
					setDrawMode("none");
					return;
				}
				if (mode === "polygon") {
					draftPointsRef.current.push([e.lngLat.lng, e.lngLat.lat]);
					updateDraft(map, draftPointsRef.current);
				}
			});
			map.on("dblclick", (e) => {
				if (drawModeRef.current !== "polygon") return;
				e.preventDefault();
				const pts = draftPointsRef.current;
				if (pts.length >= 3) onAreaChangeRef.current?.({
					type: "polygon",
					ring: [...pts]
				});
				draftPointsRef.current = [];
				updateDraft(map, []);
				setDrawMode("none");
			});
			for (const layer of [CLUSTER_LAYER, UNCLUSTERED_LAYER]) {
				map.on("mouseenter", layer, () => {
					map.getCanvas().style.cursor = "pointer";
				});
				map.on("mouseleave", layer, () => {
					map.getCanvas().style.cursor = "";
				});
			}
			setIsLoaded(true);
		});
		map.on("moveend", () => {
			const b = map.getBounds();
			onBoundsChangeRef.current?.({
				north: b.getNorth(),
				south: b.getSouth(),
				east: b.getEast(),
				west: b.getWest()
			});
		});
		mapRef.current = map;
		return () => {
			map.remove();
			mapRef.current = null;
		};
	}, []);
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !isLoaded) return;
		const newStyle = getMapStyle(styleId).style;
		map.setStyle(newStyle, { diff: false });
		const reattach = () => {
			setupOverlayRef.current?.();
			map.getSource(SOURCE_ID)?.setData(markersToGeoJSON(markers));
			map.getSource(AREA_SOURCE)?.setData(areaToGeoJSON(area));
		};
		map.once("style.load", reattach);
		return () => {
			map.off("style.load", reattach);
		};
	}, [styleId, isLoaded]);
	useEffect(() => {
		if (!mapRef.current || !isLoaded) return;
		mapRef.current.getSource(SOURCE_ID)?.setData(markersToGeoJSON(markers));
	}, [markers, isLoaded]);
	useEffect(() => {
		if (!mapRef.current || !isLoaded) return;
		mapRef.current.getSource(AREA_SOURCE)?.setData(areaToGeoJSON(area));
	}, [area, isLoaded]);
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !isLoaded) return;
		if (drawMode === "none") {
			map.getCanvas().style.cursor = "";
			map.doubleClickZoom.enable();
		} else {
			map.getCanvas().style.cursor = "crosshair";
			map.doubleClickZoom.disable();
		}
	}, [drawMode, isLoaded]);
	useEffect(() => {
		if (drawMode !== "polygon" && mapRef.current && isLoaded) {
			draftPointsRef.current = [];
			updateDraft(mapRef.current, []);
		}
	}, [drawMode, isLoaded]);
	const handleZoomIn = useCallback(() => {
		mapRef.current?.zoomIn({ duration: 200 });
	}, []);
	const handleZoomOut = useCallback(() => {
		mapRef.current?.zoomOut({ duration: 200 });
	}, []);
	const handleResetNorth = useCallback(() => {
		mapRef.current?.easeTo({
			bearing: 0,
			pitch: 0,
			duration: 400
		});
	}, []);
	const handleNearMe = useCallback(() => {
		if (!navigator.geolocation) return;
		navigator.geolocation.getCurrentPosition((pos) => {
			const { latitude: lat, longitude: lng, accuracy } = pos.coords;
			const map = mapRef.current;
			if (!map) return;
			map.getSource(USER_LOC_SOURCE)?.setData({
				type: "FeatureCollection",
				features: [{
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [lng, lat]
					},
					properties: { accuracy: accuracy ?? 50 }
				}]
			});
			if (userPulseRafRef.current != null) cancelAnimationFrame(userPulseRafRef.current);
			const start = performance.now();
			const tick = (now) => {
				const m = mapRef.current;
				if (!m || !m.getLayer(USER_LOC_HALO)) return;
				const t = (now - start) / 1500 % 1;
				const radius = 8 + t * 22;
				const opacity = .35 * (1 - t);
				m.setPaintProperty(USER_LOC_HALO, "circle-radius", radius);
				m.setPaintProperty(USER_LOC_HALO, "circle-opacity", opacity);
				userPulseRafRef.current = requestAnimationFrame(tick);
			};
			userPulseRafRef.current = requestAnimationFrame(tick);
			onAreaChangeRef.current?.({
				type: "radius",
				lat,
				lng,
				radiusKm: defaultRadiusRef.current
			});
			map.easeTo({
				center: [lng, lat],
				zoom: 13,
				duration: 700
			});
		}, () => {}, {
			enableHighAccuracy: true,
			timeout: 8e3
		});
	}, []);
	const handleClearArea = useCallback(() => {
		setDrawMode("none");
		draftPointsRef.current = [];
		if (mapRef.current) updateDraft(mapRef.current, []);
		if (userPulseRafRef.current != null) {
			cancelAnimationFrame(userPulseRafRef.current);
			userPulseRafRef.current = null;
		}
		(mapRef.current?.getSource(USER_LOC_SOURCE))?.setData({
			type: "FeatureCollection",
			features: []
		});
		onAreaChangeRef.current?.(null);
	}, []);
	const closePopup = useCallback(() => {
		if (popupRef.current) {
			popupRef.current.remove();
			popupRef.current = null;
		}
		popupContainerRef.current = null;
		setPopupItem(null);
	}, []);
	useEffect(() => {
		if (!mapRef.current || !isLoaded || !activeId) {
			closePopup();
			return;
		}
		const rich = items?.find((i) => i.id === activeId);
		if (rich) {
			mapRef.current.easeTo({
				center: [rich.longitude, rich.latitude],
				duration: 500
			});
			closePopup();
			const container = document.createElement("div");
			popupContainerRef.current = container;
			const popup = new maplibregl.Popup({
				closeButton: true,
				closeOnClick: true,
				maxWidth: "224px",
				offset: 20,
				className: "geo-bubble-popup"
			}).setLngLat([rich.longitude, rich.latitude]).setDOMContent(container).addTo(mapRef.current);
			popup.on("close", () => closePopup());
			popupRef.current = popup;
			setPopupItem(rich);
			return;
		}
		const m = markers.find((x) => x.id === activeId);
		if (m && mapRef.current) {
			mapRef.current.easeTo({
				center: [m.longitude, m.latitude],
				duration: 500
			});
			closePopup();
			const popup = new maplibregl.Popup({
				closeButton: true,
				closeOnClick: true,
				maxWidth: "224px",
				offset: 20,
				className: "geo-bubble-popup"
			}).setLngLat([m.longitude, m.latitude]).setHTML(`<a href="/listing/${m.slug}" class="geo-popup-lite">
            <div class="geo-popup-lite-cat">${m.category}</div>
            <div class="geo-popup-lite-price">${formatMarkerPrice(m.price)} ${m.currency}</div>
            <div class="geo-popup-lite-cta">View details →</div>
          </a>`).addTo(mapRef.current);
			popup.on("close", () => closePopup());
			popupRef.current = popup;
		}
	}, [
		activeId,
		items,
		markers,
		isLoaded,
		closePopup
	]);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative h-full w-full",
		children: [
			/* @__PURE__ */ jsx("div", {
				ref: containerRef,
				className: "h-full w-full"
			}),
			!hideToolbar && /* @__PURE__ */ jsx(MapToolbar, {
				drawMode,
				area: area ? area.type === "radius" ? {
					type: "radius",
					radiusKm: area.radiusKm
				} : {
					type: "polygon",
					vertices: area.ring.length
				} : null,
				onNearMe: handleNearMe,
				onStartRadius: () => setDrawMode((m) => m === "radius" ? "none" : "radius"),
				onStartPolygon: () => setDrawMode((m) => m === "polygon" ? "none" : "polygon"),
				onClear: handleClearArea,
				onRadiusChange: (km) => {
					if (area?.type === "radius") onAreaChangeRef.current?.({
						type: "radius",
						lat: area.lat,
						lng: area.lng,
						radiusKm: km
					});
				},
				styleSlot: /* @__PURE__ */ jsx(MapStyleSwitcher, {
					value: styleId,
					onChange: handleStyleChange
				})
			}),
			!hideNavControls && /* @__PURE__ */ jsx("div", {
				className: "pointer-events-auto absolute right-3 top-3 z-10 flex flex-col items-end gap-2",
				children: /* @__PURE__ */ jsx(MapNavControls, {
					bearing,
					onZoomIn: handleZoomIn,
					onZoomOut: handleZoomOut,
					onResetNorth: handleResetNorth,
					onGeolocate: handleNearMe
				})
			}),
			popupItem && popupContainerRef.current && createPortal(/* @__PURE__ */ jsx(ListingCard, {
				item: popupItem,
				variant: "bubble",
				onSelect: () => onSelect?.(popupItem.id)
			}), popupContainerRef.current),
			/* @__PURE__ */ jsx("style", { children: `
        .geo-bubble-popup .maplibregl-popup-content {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .geo-bubble-popup .maplibregl-popup-tip {
          border-top-color: var(--color-card);
        }
        .geo-bubble-popup .maplibregl-popup-close-button {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.45);
          color: white;
          border-radius: 50%;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          z-index: 10;
          transition: background 150ms ease;
        }
        .geo-bubble-popup .maplibregl-popup-close-button:hover {
          background: rgba(0,0,0,0.7);
        }
        .geo-popup-lite {
          display: block;
          padding: 12px 14px;
          background: var(--color-card);
          color: var(--color-foreground);
          text-decoration: none;
          font-family: system-ui, sans-serif;
          min-width: 160px;
        }
        .geo-popup-lite-cat {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-3, #6b7280);
          margin-bottom: 4px;
        }
        .geo-popup-lite-price {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .geo-popup-lite-cta {
          font-size: 11px;
          color: var(--amber-ink, #b45309);
        }
      ` })
		]
	});
}
//#endregion
export { featuredListingsQueryOptions as a, listingInfiniteQueryOptions as c, similarListingsQueryOptions as d, ShareMenu as i, mapMarkersQueryOptions as l, Toggle$1 as n, homeStatsQueryOptions as o, ListingCard as r, listingDetailQueryOptions as s, MapView as t, scrapedListingsQueryOptions as u };
