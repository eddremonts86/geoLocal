import { n as encodePolygon, t as decodePolygon } from "./spatial-ChWRs6lm.js";
import { t as cn } from "./utils-C17k1q7P.js";
import { t as Button } from "./button-D7roF92S.js";
import { i as SheetTitle, n as SheetContent, r as SheetHeader, t as Sheet } from "./sheet-CpC1RgXs.js";
import { t as useFavorites } from "./useFavorites-Biw4cw7b.js";
import { t as Skeleton } from "./skeleton-CRJxhCYm.js";
import { t as Input } from "./input-DBuzo6nR.js";
import { t as Badge } from "./badge-C9JK8Bm8.js";
import { i as VEHICLE_SUBCATEGORIES, n as PROPERTY_SUBCATEGORIES, r as SERVICE_SUBCATEGORIES, t as EXPERIENCE_SUBCATEGORIES } from "./types-C9x-qFiw.js";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu$1 } from "./dropdown-menu-DK24gMQb.js";
import { c as listingInfiniteQueryOptions, l as mapMarkersQueryOptions, n as Toggle$1, r as ListingCard, t as MapView } from "./MapView-DsIinqAq.js";
import { t as Label$1 } from "./label-CY_jSNfS.js";
import * as React$1 from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AnimatePresence, m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Accordion, ScrollArea, Switch } from "radix-ui";
import { ArrowUpDown, Car, ChevronDown, Home, List, Map, Search, SlidersHorizontal, Sparkles, Wrench, X } from "lucide-react";
import { parseAsArrayOf, parseAsBoolean, parseAsFloat, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
//#region src/modules/explore/state/search-params.ts
/**
* Centralised URL ↔ state parsers for /explore.
*
* Adding a new filter? Three places to wire it:
*   1. Here (parser + URL key).
*   2. `searchListingsFn` in `listings/api/listings.fn.ts` (z input + filter logic).
*   3. The matching filter component in `explore/filters/`.
*/
var exploreParsers = {
	category: parseAsStringEnum([
		"property",
		"vehicle",
		"service",
		"experience"
	]),
	subCategory: parseAsArrayOf(parseAsString),
	transactionType: parseAsStringEnum([
		"buy",
		"rent",
		"hire"
	]),
	q: parseAsString.withDefault(""),
	priceMin: parseAsInteger,
	priceMax: parseAsInteger,
	sort: parseAsStringEnum([
		"popular",
		"newest",
		"price_asc",
		"price_desc"
	]).withDefault("newest"),
	page: parseAsInteger.withDefault(1),
	sourceKind: parseAsStringEnum(["user", "scraped"]),
	scrapedSource: parseAsArrayOf(parseAsString),
	lat: parseAsFloat,
	lng: parseAsFloat,
	zoom: parseAsFloat,
	nearLat: parseAsFloat,
	nearLng: parseAsFloat,
	nearRadius: parseAsFloat,
	polygon: parseAsString,
	listingId: parseAsString,
	beds: parseAsArrayOf(parseAsString),
	baths: parseAsInteger,
	areaMin: parseAsFloat,
	areaMax: parseAsFloat,
	yearBuiltMin: parseAsInteger,
	yearBuiltMax: parseAsInteger,
	parkingMin: parseAsInteger,
	furnished: parseAsBoolean,
	make: parseAsArrayOf(parseAsString),
	yearMin: parseAsInteger,
	yearMax: parseAsInteger,
	fuelType: parseAsArrayOf(parseAsStringEnum([
		"gasoline",
		"diesel",
		"electric",
		"hybrid"
	])),
	transmission: parseAsStringEnum(["manual", "automatic"]),
	mileageMax: parseAsInteger,
	doorsMin: parseAsInteger,
	colors: parseAsArrayOf(parseAsString),
	experienceMin: parseAsInteger,
	serviceRadiusMin: parseAsFloat,
	responseTime: parseAsStringEnum([
		"within_hour",
		"same_day",
		"few_days"
	]),
	certified: parseAsBoolean,
	durationMin: parseAsFloat,
	durationMax: parseAsFloat,
	groupMax: parseAsInteger,
	minAgeMax: parseAsInteger,
	languages: parseAsArrayOf(parseAsString),
	difficulty: parseAsStringEnum([
		"easy",
		"moderate",
		"hard"
	])
};
//#endregion
//#region src/modules/explore/ui/ExploreTopBar.tsx
var SORT_OPTIONS = [
	{
		value: "popular",
		labelKey: "explore.popular"
	},
	{
		value: "newest",
		labelKey: "explore.newest"
	},
	{
		value: "price_asc",
		labelKey: "explore.priceAsc"
	},
	{
		value: "price_desc",
		labelKey: "explore.priceDesc"
	}
];
var CATEGORY_META = [
	{
		value: null,
		icon: null,
		labelKey: "explore.allCategories"
	},
	{
		value: "property",
		icon: Home,
		labelKey: "explore.properties"
	},
	{
		value: "vehicle",
		icon: Car,
		labelKey: "explore.vehicles"
	},
	{
		value: "service",
		icon: Wrench,
		labelKey: "explore.services"
	},
	{
		value: "experience",
		icon: Sparkles,
		labelKey: "explore.experiences"
	}
];
function buildActiveChips(props) {
	const chips = [];
	if (props.transactionType) chips.push({
		key: "tx",
		label: props.transactionType === "buy" ? "Buy" : props.transactionType === "rent" ? "Rent" : "Hire",
		onRemove: () => props.onTransactionTypeChange(null)
	});
	if (props.priceMin != null) chips.push({
		key: "priceMin",
		label: `From ${props.priceMin.toLocaleString()} DKK`,
		onRemove: () => props.onPriceMinChange(null)
	});
	if (props.priceMax != null) chips.push({
		key: "priceMax",
		label: `To ${props.priceMax.toLocaleString()} DKK`,
		onRemove: () => props.onPriceMaxChange(null)
	});
	if (props.beds?.length) chips.push({
		key: "beds",
		label: `${props.beds.join(", ")} beds`,
		onRemove: () => props.onBedsChange(null)
	});
	if (props.baths != null) chips.push({
		key: "baths",
		label: `${props.baths}+ baths`,
		onRemove: () => props.onBathsChange(null)
	});
	if (props.areaMin != null) chips.push({
		key: "areaMin",
		label: `From ${props.areaMin} m²`,
		onRemove: () => props.onAreaMinChange(null)
	});
	if (props.areaMax != null) chips.push({
		key: "areaMax",
		label: `To ${props.areaMax} m²`,
		onRemove: () => props.onAreaMaxChange(null)
	});
	if (props.make?.length) chips.push({
		key: "make",
		label: props.make.join(", "),
		onRemove: () => props.onMakeChange(null)
	});
	if (props.subCategory?.length) chips.push({
		key: "subcat",
		label: props.subCategory.join(", "),
		onRemove: () => props.onSubCategoryChange(null)
	});
	if (props.yearMin != null) chips.push({
		key: "yearMin",
		label: `From ${props.yearMin}`,
		onRemove: () => props.onYearMinChange(null)
	});
	if (props.fuelType?.length) chips.push({
		key: "fuel",
		label: props.fuelType.join(", "),
		onRemove: () => props.onFuelTypeChange(null)
	});
	if (props.transmission) chips.push({
		key: "tx-type",
		label: props.transmission,
		onRemove: () => props.onTransmissionChange(null)
	});
	if (props.experienceMin != null) chips.push({
		key: "exp",
		label: `${props.experienceMin}+ yrs exp.`,
		onRemove: () => props.onExperienceMinChange(null)
	});
	return chips;
}
function ExploreTopBar(props) {
	const { t } = useTranslation();
	const categoryScrollRef = useRef(null);
	const chips = buildActiveChips(props);
	const [localQuery, setLocalQuery] = useState(props.query ?? "");
	useEffect(() => {
		setLocalQuery(props.query ?? "");
	}, [props.query]);
	useEffect(() => {
		if ((localQuery ?? "") === (props.query ?? "")) return;
		const id = setTimeout(() => props.onQueryChange(localQuery ?? ""), 250);
		return () => clearTimeout(id);
	}, [localQuery]);
	return /* @__PURE__ */ jsxs("div", {
		className: "shrink-0 border-b border-border bg-background",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-4 px-5 py-3",
			children: [/* @__PURE__ */ jsx("div", {
				ref: categoryScrollRef,
				className: "flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none",
				style: { scrollbarWidth: "none" },
				children: CATEGORY_META.map(({ value, icon: Icon, labelKey }) => {
					return /* @__PURE__ */ jsxs(Toggle$1, {
						pressed: props.category === value,
						onPressedChange: () => props.onCategoryChange(value),
						size: "sm",
						className: "shrink-0 rounded-full px-3.5 text-xs font-medium data-[state=on]:bg-foreground data-[state=on]:text-background",
						children: [Icon && /* @__PURE__ */ jsx(Icon, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.5
						}), t(labelKey, String(value ?? "All"))]
					}, String(value));
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex shrink-0 items-center gap-3 pl-3",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "group flex h-8 w-36 items-center gap-2 rounded-full border border-border bg-background pl-3 pr-1 text-xs transition-colors focus-within:border-foreground hover:border-foreground md:w-56",
						htmlFor: "explore-search-input",
						children: [
							/* @__PURE__ */ jsx(Search, {
								className: "h-3.5 w-3.5 shrink-0 text-muted-foreground group-focus-within:text-foreground",
								strokeWidth: 1.75,
								"aria-hidden": true
							}),
							/* @__PURE__ */ jsx("input", {
								id: "explore-search-input",
								type: "text",
								value: localQuery ?? "",
								onChange: (e) => setLocalQuery(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Escape") {
										setLocalQuery("");
										props.onQueryChange("");
										e.target.blur();
									}
								},
								placeholder: t("explore.searchPlaceholder", "Search…"),
								className: "min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground",
								"aria-label": t("explore.searchAria", "Search listings")
							}),
							(localQuery?.length ?? 0) > 0 && /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => {
									setLocalQuery("");
									props.onQueryChange("");
								},
								className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								"aria-label": t("explore.clearSearch", "Clear search"),
								children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
							})
						]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "font-mono text-xs tabular-nums text-muted-foreground",
						children: [
							props.total.toLocaleString(),
							" ",
							t("property.resultCount", "results")
						]
					}),
					/* @__PURE__ */ jsxs(DropdownMenu$1, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							size: "xs",
							className: "gap-1.5 text-xs text-muted-foreground hover:text-foreground",
							children: [/* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: t(`explore.${props.sort ?? "newest"}`, props.sort ?? "Newest") })]
						})
					}), /* @__PURE__ */ jsx(DropdownMenuContent, {
						align: "end",
						className: "rounded-none",
						children: SORT_OPTIONS.map((opt) => /* @__PURE__ */ jsx(DropdownMenuItem, {
							onClick: () => props.onSortChange(opt.value),
							className: `rounded-none text-xs ${props.sort === opt.value ? "font-medium text-foreground" : ""}`,
							children: t(opt.labelKey, opt.value)
						}, opt.value))
					})] }),
					/* @__PURE__ */ jsxs(Toggle$1, {
						pressed: props.activeFilterCount > 0,
						onPressedChange: props.onFiltersOpen,
						size: "sm",
						variant: "outline",
						className: "rounded-full px-3.5 text-xs font-medium data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background",
						children: [
							/* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-3.5 w-3.5" }),
							t("filters.filters", "Filters"),
							props.activeFilterCount > 0 && /* @__PURE__ */ jsx("span", {
								className: "ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-foreground",
								children: props.activeFilterCount
							})
						]
					})
				]
			})]
		}), /* @__PURE__ */ jsx(AnimatePresence, { children: chips.length > 0 && /* @__PURE__ */ jsx(m.div, {
			initial: {
				height: 0,
				opacity: 0
			},
			animate: {
				height: "auto",
				opacity: 1
			},
			exit: {
				height: 0,
				opacity: 0
			},
			transition: { duration: .2 },
			className: "overflow-hidden",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-1.5 border-t border-border px-5 py-2",
				children: [chips.map((chip) => /* @__PURE__ */ jsx(Badge, {
					asChild: true,
					variant: "outline",
					className: "cursor-pointer gap-1 hover:border-foreground hover:bg-muted/80",
					children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: chip.onRemove,
						children: [chip.label, /* @__PURE__ */ jsx(X, { className: "h-3 w-3 text-muted-foreground" })]
					})
				}, chip.key)), /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "xs",
					onClick: props.onClearAll,
					className: "ml-1 text-xs text-muted-foreground",
					children: t("filters.clearAll", "Clear all")
				})]
			})
		}) })]
	});
}
//#endregion
//#region src/components/ui/scroll-area.tsx
function ScrollArea$1({ className, children, ...props }) {
	return /* @__PURE__ */ jsxs(ScrollArea.Root, {
		"data-slot": "scroll-area",
		className: cn("relative", className),
		...props,
		children: [
			/* @__PURE__ */ jsx(ScrollArea.Viewport, {
				"data-slot": "scroll-area-viewport",
				className: "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
				children
			}),
			/* @__PURE__ */ jsx(ScrollBar, {}),
			/* @__PURE__ */ jsx(ScrollArea.Corner, {})
		]
	});
}
function ScrollBar({ className, orientation = "vertical", ...props }) {
	return /* @__PURE__ */ jsx(ScrollArea.ScrollAreaScrollbar, {
		"data-slot": "scroll-area-scrollbar",
		orientation,
		className: cn("flex touch-none p-px transition-colors select-none", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent", className),
		...props,
		children: /* @__PURE__ */ jsx(ScrollArea.ScrollAreaThumb, {
			"data-slot": "scroll-area-thumb",
			className: "relative flex-1 rounded-full bg-border"
		})
	});
}
//#endregion
//#region src/components/ui/accordion.tsx
var Accordion$1 = Accordion.Root;
var AccordionItem = React$1.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(Accordion.Item, {
	ref,
	className: cn("border-b border-border last:border-0", className),
	...props
}));
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = React$1.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(Accordion.Header, {
	className: "flex",
	children: /* @__PURE__ */ jsxs(Accordion.Trigger, {
		ref,
		className: cn("flex flex-1 items-center justify-between gap-2 py-4 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground [&[data-state=open]>svg]:rotate-180 [&[data-state=open]]:text-foreground", className),
		...props,
		children: [children, /* @__PURE__ */ jsx(ChevronDown, {
			className: "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
			strokeWidth: 1.75
		})]
	})
}));
AccordionTrigger.displayName = "AccordionTrigger";
var AccordionContent = React$1.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(Accordion.Content, {
	ref,
	className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
	...props,
	children: /* @__PURE__ */ jsx("div", {
		className: cn("pb-5", className),
		children
	})
}));
AccordionContent.displayName = "AccordionContent";
//#endregion
//#region src/components/ui/switch.tsx
function Switch$1({ className, size = "default", ...props }) {
	return /* @__PURE__ */ jsx(Switch.Root, {
		"data-slot": "switch",
		"data-size": size,
		className: cn("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", className),
		...props,
		children: /* @__PURE__ */ jsx(Switch.Thumb, {
			"data-slot": "switch-thumb",
			className: cn("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/modules/explore/filters/PropertyFilters.tsx
var BED_OPTIONS = [
	"studio",
	"1",
	"2",
	"3",
	"4",
	"5+"
];
var PILL_CLASS$5 = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
function SectionLabel$4({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
		children
	});
}
function PropertyFilters({ subCategory, beds, baths, areaMin, areaMax, yearBuiltMin, yearBuiltMax, parkingMin, furnished, onSubCategoryChange, onBedsChange, onBathsChange, onAreaMinChange, onAreaMaxChange, onYearBuiltMinChange, onYearBuiltMaxChange, onParkingMinChange, onFurnishedChange }) {
	const { t } = useTranslation();
	const toggleSubCat = (val) => {
		const current = subCategory ?? [];
		if (current.includes(val)) {
			const next = current.filter((x) => x !== val);
			onSubCategoryChange(next.length ? next : null);
		} else onSubCategoryChange([...current, val]);
	};
	const toggleBed = (val) => {
		const current = beds ?? [];
		if (current.includes(val)) {
			const next = current.filter((b) => b !== val);
			onBedsChange(next.length ? next : null);
		} else onBedsChange([...current, val]);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$4, { children: t("filters.propertyType", "Property type") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: PROPERTY_SUBCATEGORIES.map((val) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!subCategory?.includes(val),
					onPressedChange: () => toggleSubCat(val),
					variant: "outline",
					className: PILL_CLASS$5,
					children: t(`filters.subcat_${val}`, val)
				}, val))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$4, { children: t("filters.bedrooms", "Bedrooms") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: BED_OPTIONS.map((opt) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!beds?.includes(opt),
					onPressedChange: () => toggleBed(opt),
					variant: "outline",
					className: PILL_CLASS$5,
					children: opt === "studio" ? t("filters.studio", "Studio") : opt
				}, opt))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$4, { children: t("filters.bathrooms", "Bathrooms") }), /* @__PURE__ */ jsx("div", {
				className: "flex gap-2",
				children: [
					1,
					2,
					3,
					4
				].map((n) => /* @__PURE__ */ jsxs(Toggle$1, {
					pressed: baths === n,
					onPressedChange: () => onBathsChange(baths === n ? null : n),
					variant: "outline",
					className: PILL_CLASS$5,
					children: [n, "+"]
				}, n))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$4, { children: t("filters.area", "Area (m²)") }), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "mb-1 text-xs text-muted-foreground",
							children: t("filters.min", "Min")
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							placeholder: "0 m²",
							value: areaMin ?? "",
							onChange: (e) => onAreaMinChange(e.target.value ? Number(e.target.value) : null)
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "mt-5 text-muted-foreground",
						children: "–"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "mb-1 text-xs text-muted-foreground",
							children: t("filters.max", "Max")
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							placeholder: "∞ m²",
							value: areaMax ?? "",
							onChange: (e) => onAreaMaxChange(e.target.value ? Number(e.target.value) : null)
						})]
					})
				]
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$4, { children: t("filters.yearBuilt", "Year built") }), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "mb-1 text-xs text-muted-foreground",
							children: t("filters.from", "From")
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							placeholder: "1900",
							value: yearBuiltMin ?? "",
							onChange: (e) => onYearBuiltMinChange(e.target.value ? Number(e.target.value) : null)
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "mt-5 text-muted-foreground",
						children: "–"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "mb-1 text-xs text-muted-foreground",
							children: t("filters.to", "To")
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							placeholder: "2026",
							value: yearBuiltMax ?? "",
							onChange: (e) => onYearBuiltMaxChange(e.target.value ? Number(e.target.value) : null)
						})]
					})
				]
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$4, { children: t("filters.parking", "Parking spaces") }), /* @__PURE__ */ jsx("div", {
				className: "flex gap-2",
				children: [
					1,
					2,
					3
				].map((n) => /* @__PURE__ */ jsxs(Toggle$1, {
					pressed: parkingMin === n,
					onPressedChange: () => onParkingMinChange(parkingMin === n ? null : n),
					variant: "outline",
					className: PILL_CLASS$5,
					children: [n, "+"]
				}, n))
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between rounded-lg border border-border px-4 py-3",
				children: [/* @__PURE__ */ jsx(Label$1, {
					htmlFor: "furnished-switch",
					className: "text-sm font-normal",
					children: t("filters.furnishedOnly", "Furnished only")
				}), /* @__PURE__ */ jsx(Switch$1, {
					id: "furnished-switch",
					checked: furnished === true,
					onCheckedChange: (v) => onFurnishedChange(v ? true : null)
				})]
			})
		]
	});
}
//#endregion
//#region src/modules/explore/filters/VehicleFilters.tsx
var FUEL_OPTIONS = [
	{
		value: "gasoline",
		label: "Gasoline"
	},
	{
		value: "diesel",
		label: "Diesel"
	},
	{
		value: "electric",
		label: "Electric"
	},
	{
		value: "hybrid",
		label: "Hybrid"
	}
];
var POPULAR_MAKES = [
	"Toyota",
	"Volkswagen",
	"BMW",
	"Mercedes-Benz",
	"Audi",
	"Tesla",
	"Ford",
	"Hyundai",
	"Volvo",
	"Peugeot"
];
var COLOR_OPTIONS = [
	{
		value: "black",
		label: "Black",
		swatch: "#111"
	},
	{
		value: "white",
		label: "White",
		swatch: "#f5f5f5"
	},
	{
		value: "silver",
		label: "Silver",
		swatch: "#c0c0c0"
	},
	{
		value: "gray",
		label: "Gray",
		swatch: "#666"
	},
	{
		value: "blue",
		label: "Blue",
		swatch: "#1e40af"
	},
	{
		value: "red",
		label: "Red",
		swatch: "#dc2626"
	},
	{
		value: "green",
		label: "Green",
		swatch: "#16a34a"
	},
	{
		value: "beige",
		label: "Beige",
		swatch: "#e7d3a4"
	}
];
var PILL_CLASS$4 = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
function SectionLabel$3({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
		children
	});
}
function VehicleFilters({ subCategory, make, yearMin, yearMax, fuelType, transmission, mileageMax, doorsMin, colors, onSubCategoryChange, onMakeChange, onYearMinChange, onYearMaxChange, onFuelTypeChange, onTransmissionChange, onMileageMaxChange, onDoorsMinChange, onColorsChange }) {
	const { t } = useTranslation();
	const toggleSubCat = (val) => {
		const current = subCategory ?? [];
		if (current.includes(val)) {
			const next = current.filter((x) => x !== val);
			onSubCategoryChange(next.length ? next : null);
		} else onSubCategoryChange([...current, val]);
	};
	const toggleMake = (m) => {
		const current = make ?? [];
		if (current.includes(m)) {
			const next = current.filter((x) => x !== m);
			onMakeChange(next.length ? next : null);
		} else onMakeChange([...current, m]);
	};
	const toggleFuel = (f) => {
		const current = fuelType ?? [];
		if (current.includes(f)) {
			const next = current.filter((x) => x !== f);
			onFuelTypeChange(next.length ? next : null);
		} else onFuelTypeChange([...current, f]);
	};
	const toggleColor = (c) => {
		const current = colors ?? [];
		if (current.includes(c)) {
			const next = current.filter((x) => x !== c);
			onColorsChange(next.length ? next : null);
		} else onColorsChange([...current, c]);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$3, { children: t("filters.vehicleType", "Vehicle type") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: VEHICLE_SUBCATEGORIES.map((val) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!subCategory?.includes(val),
					onPressedChange: () => toggleSubCat(val),
					variant: "outline",
					className: PILL_CLASS$4,
					children: t(`filters.subcat_${val}`, val)
				}, val))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$3, { children: t("filters.make", "Make") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: POPULAR_MAKES.map((m) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!make?.includes(m),
					onPressedChange: () => toggleMake(m),
					variant: "outline",
					className: PILL_CLASS$4,
					children: m
				}, m))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$3, { children: t("filters.year", "Year") }), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "mb-1 text-xs text-muted-foreground",
							children: t("filters.from", "From")
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							placeholder: "2000",
							value: yearMin ?? "",
							onChange: (e) => onYearMinChange(e.target.value ? Number(e.target.value) : null)
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "mt-5 text-muted-foreground",
						children: "–"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "mb-1 text-xs text-muted-foreground",
							children: t("filters.to", "To")
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							placeholder: "2026",
							value: yearMax ?? "",
							onChange: (e) => onYearMaxChange(e.target.value ? Number(e.target.value) : null)
						})]
					})
				]
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$3, { children: t("filters.mileageMax", "Max mileage (km)") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: [
					5e4,
					1e5,
					15e4,
					2e5
				].map((km) => /* @__PURE__ */ jsxs(Toggle$1, {
					pressed: mileageMax === km,
					onPressedChange: () => onMileageMaxChange(mileageMax === km ? null : km),
					variant: "outline",
					className: PILL_CLASS$4,
					children: [
						"≤ ",
						km.toLocaleString(),
						" km"
					]
				}, km))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$3, { children: t("filters.fuelType", "Fuel Type") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: FUEL_OPTIONS.map(({ value, label }) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!fuelType?.includes(value),
					onPressedChange: () => toggleFuel(value),
					variant: "outline",
					className: PILL_CLASS$4,
					children: label
				}, value))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$3, { children: t("filters.transmission", "Transmission") }), /* @__PURE__ */ jsx("div", {
				className: "flex gap-2",
				children: ["manual", "automatic"].map((val) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: transmission === val,
					onPressedChange: () => onTransmissionChange(transmission === val ? null : val),
					variant: "outline",
					className: PILL_CLASS$4,
					children: val === "manual" ? t("filters.manual", "Manual") : t("filters.automatic", "Automatic")
				}, val))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$3, { children: t("filters.doors", "Doors") }), /* @__PURE__ */ jsx("div", {
				className: "flex gap-2",
				children: [
					2,
					3,
					4,
					5
				].map((n) => /* @__PURE__ */ jsxs(Toggle$1, {
					pressed: doorsMin === n,
					onPressedChange: () => onDoorsMinChange(doorsMin === n ? null : n),
					variant: "outline",
					className: PILL_CLASS$4,
					children: [n, "+"]
				}, n))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$3, { children: t("filters.color", "Color") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: COLOR_OPTIONS.map(({ value, label, swatch }) => /* @__PURE__ */ jsxs(Toggle$1, {
					pressed: !!colors?.includes(value),
					onPressedChange: () => toggleColor(value),
					variant: "outline",
					className: `${PILL_CLASS$4} flex items-center gap-2`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "h-3 w-3 rounded-full border border-border",
						style: { backgroundColor: swatch },
						"aria-hidden": true
					}), label]
				}, value))
			})] })
		]
	});
}
//#endregion
//#region src/modules/explore/filters/ServiceFilters.tsx
var PILL_CLASS$3 = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
function SectionLabel$2({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
		children
	});
}
var RESPONSE_OPTIONS = [
	{
		value: "within_hour",
		label: "Within 1h"
	},
	{
		value: "same_day",
		label: "Same day"
	},
	{
		value: "few_days",
		label: "Few days"
	}
];
function ServiceFilters({ subCategory, experienceMin, serviceRadiusMin, responseTime, certified, onSubCategoryChange, onExperienceMinChange, onServiceRadiusMinChange, onResponseTimeChange, onCertifiedChange }) {
	const { t } = useTranslation();
	const toggleSubCat = (val) => {
		const current = subCategory ?? [];
		if (current.includes(val)) {
			const next = current.filter((x) => x !== val);
			onSubCategoryChange(next.length ? next : null);
		} else onSubCategoryChange([...current, val]);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$2, { children: t("filters.serviceType", "Service type") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: SERVICE_SUBCATEGORIES.map((val) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!subCategory?.includes(val),
					onPressedChange: () => toggleSubCat(val),
					variant: "outline",
					className: PILL_CLASS$3,
					children: t(`filters.subcat_${val}`, val.replace(/_/g, " "))
				}, val))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$2, { children: t("filters.experience", "Min. experience") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: [
					1,
					3,
					5,
					10
				].map((yr) => /* @__PURE__ */ jsxs(Toggle$1, {
					pressed: experienceMin === yr,
					onPressedChange: () => onExperienceMinChange(experienceMin === yr ? null : yr),
					variant: "outline",
					className: PILL_CLASS$3,
					children: [
						yr,
						"+ ",
						t("filters.years", "yrs")
					]
				}, yr))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$2, { children: t("filters.serviceRadius", "Coverage radius") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: [
					5,
					10,
					25,
					50
				].map((km) => /* @__PURE__ */ jsxs(Toggle$1, {
					pressed: serviceRadiusMin === km,
					onPressedChange: () => onServiceRadiusMinChange(serviceRadiusMin === km ? null : km),
					variant: "outline",
					className: PILL_CLASS$3,
					children: [km, "+ km"]
				}, km))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$2, { children: t("filters.responseTime", "Response time") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: RESPONSE_OPTIONS.map(({ value, label }) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: responseTime === value,
					onPressedChange: () => onResponseTimeChange(responseTime === value ? null : value),
					variant: "outline",
					className: PILL_CLASS$3,
					children: label
				}, value))
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between rounded-lg border border-border px-4 py-3",
				children: [/* @__PURE__ */ jsx(Label$1, {
					htmlFor: "certified-switch",
					className: "text-sm font-normal",
					children: t("filters.certifiedOnly", "Certified providers only")
				}), /* @__PURE__ */ jsx(Switch$1, {
					id: "certified-switch",
					checked: certified === true,
					onCheckedChange: (v) => onCertifiedChange(v ? true : null)
				})]
			})
		]
	});
}
//#endregion
//#region src/modules/explore/filters/ExperienceFilters.tsx
var PILL_CLASS$2 = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
var SUBCATEGORY_LABELS = {
	outdoor: "Outdoor",
	culinary: "Culinary",
	cultural: "Cultural",
	wellness: "Wellness",
	art: "Art & Craft",
	sports: "Sports",
	nightlife: "Nightlife",
	guided_tour: "Guided Tour"
};
var DURATION_OPTIONS = [
	{
		label: "≤ 2h",
		value: 2
	},
	{
		label: "≤ 4h",
		value: 4
	},
	{
		label: "Half day",
		value: 6
	},
	{
		label: "Full day",
		value: 12
	}
];
var GROUP_OPTIONS = [
	{
		label: "≤ 2",
		value: 2
	},
	{
		label: "≤ 5",
		value: 5
	},
	{
		label: "≤ 10",
		value: 10
	},
	{
		label: "20+",
		value: 20
	}
];
var AGE_OPTIONS = [
	{
		label: "Family (0+)",
		value: 0
	},
	{
		label: "Teens+ (12)",
		value: 12
	},
	{
		label: "Adults (18+)",
		value: 18
	}
];
var LANGUAGE_OPTIONS = [
	{
		value: "en",
		label: "English"
	},
	{
		value: "da",
		label: "Dansk"
	},
	{
		value: "es",
		label: "Español"
	},
	{
		value: "fr",
		label: "Français"
	},
	{
		value: "de",
		label: "Deutsch"
	},
	{
		value: "sv",
		label: "Svenska"
	},
	{
		value: "no",
		label: "Norsk"
	}
];
var DIFFICULTY_OPTIONS = [
	{
		value: "easy",
		label: "Easy"
	},
	{
		value: "moderate",
		label: "Moderate"
	},
	{
		value: "hard",
		label: "Challenging"
	}
];
function SectionLabel$1({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
		children
	});
}
function ExperienceFilters({ subCategory, durationMin, durationMax, groupMax, minAgeMax, languages, difficulty, onSubCategoryChange, onDurationMinChange, onDurationMaxChange, onGroupMaxChange, onMinAgeMaxChange, onLanguagesChange, onDifficultyChange }) {
	const { t } = useTranslation();
	function toggleSubCategory(val) {
		const current = subCategory ?? [];
		const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
		onSubCategoryChange(next.length > 0 ? next : null);
	}
	function toggleLanguage(val) {
		const current = languages ?? [];
		const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
		onLanguagesChange(next.length > 0 ? next : null);
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.experienceType", "Experience type") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: EXPERIENCE_SUBCATEGORIES.map((sub) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: subCategory?.includes(sub) ?? false,
					onPressedChange: () => toggleSubCategory(sub),
					variant: "outline",
					className: PILL_CLASS$2,
					children: SUBCATEGORY_LABELS[sub] ?? sub
				}, sub))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.durationMin", "Minimum duration") }),
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap gap-2",
					children: DURATION_OPTIONS.map((opt) => /* @__PURE__ */ jsxs(Toggle$1, {
						pressed: durationMin === opt.value,
						onPressedChange: () => onDurationMinChange(durationMin === opt.value ? null : opt.value),
						variant: "outline",
						className: PILL_CLASS$2,
						children: [opt.label, "+"]
					}, `min-${opt.value}`))
				}),
				/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.durationMax", "Maximum duration") }),
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap gap-2",
					children: DURATION_OPTIONS.map((opt) => /* @__PURE__ */ jsx(Toggle$1, {
						pressed: durationMax === opt.value,
						onPressedChange: () => onDurationMaxChange(durationMax === opt.value ? null : opt.value),
						variant: "outline",
						className: PILL_CLASS$2,
						children: opt.label
					}, `max-${opt.value}`))
				})
			] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.groupSize", "Max group size") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: GROUP_OPTIONS.map((opt) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: groupMax === opt.value,
					onPressedChange: () => onGroupMaxChange(groupMax === opt.value ? null : opt.value),
					variant: "outline",
					className: PILL_CLASS$2,
					children: opt.label
				}, opt.value))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.age", "Age requirement") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: AGE_OPTIONS.map((opt) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: minAgeMax === opt.value,
					onPressedChange: () => onMinAgeMaxChange(minAgeMax === opt.value ? null : opt.value),
					variant: "outline",
					className: PILL_CLASS$2,
					children: opt.label
				}, opt.value))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.languages", "Languages") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: LANGUAGE_OPTIONS.map(({ value, label }) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!languages?.includes(value),
					onPressedChange: () => toggleLanguage(value),
					variant: "outline",
					className: PILL_CLASS$2,
					children: label
				}, value))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.difficulty", "Difficulty") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: DIFFICULTY_OPTIONS.map(({ value, label }) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: difficulty === value,
					onPressedChange: () => onDifficultyChange(difficulty === value ? null : value),
					variant: "outline",
					className: PILL_CLASS$2,
					children: label
				}, value))
			})] })
		]
	});
}
//#endregion
//#region src/modules/explore/filters/SourceFilter.tsx
var PILL_CLASS$1 = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
/**
* Mirrors the registry seeded in `drizzle/0008_scraping_sources_registry.sql`.
* Keep the keys in sync with `scraping_sources.key`.
*/
var SCRAPED_SOURCES = [
	{
		key: "airbnb",
		label: "Airbnb"
	},
	{
		key: "facebook",
		label: "Facebook Pages"
	},
	{
		key: "facebook-events",
		label: "Facebook Events"
	},
	{
		key: "linkedin",
		label: "LinkedIn"
	},
	{
		key: "edc",
		label: "EDC"
	},
	{
		key: "homestra",
		label: "Homestra"
	},
	{
		key: "boligsiden",
		label: "Boligsiden"
	},
	{
		key: "boliga",
		label: "Boliga"
	}
];
function SectionLabel({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
		children
	});
}
function SourceFilter({ sourceKind, scrapedSource, onSourceKindChange, onScrapedSourceChange }) {
	const { t } = useTranslation();
	const toggleSource = (key) => {
		const current = scrapedSource ?? [];
		if (current.includes(key)) {
			const next = current.filter((x) => x !== key);
			onScrapedSourceChange(next.length ? next : null);
		} else onScrapedSourceChange([...current, key]);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel, { children: t("filters.origin", "Origin") }), /* @__PURE__ */ jsxs("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ jsx(Toggle$1, {
				pressed: sourceKind === "user",
				onPressedChange: () => onSourceKindChange(sourceKind === "user" ? null : "user"),
				variant: "outline",
				className: PILL_CLASS$1,
				children: t("filters.userListings", "User listings")
			}), /* @__PURE__ */ jsx(Toggle$1, {
				pressed: sourceKind === "scraped",
				onPressedChange: () => onSourceKindChange(sourceKind === "scraped" ? null : "scraped"),
				variant: "outline",
				className: PILL_CLASS$1,
				children: t("filters.aggregated", "Aggregated")
			})]
		})] }), sourceKind !== "user" && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel, { children: t("filters.scrapedSource", "Sources") }), /* @__PURE__ */ jsx("div", {
			className: "flex flex-wrap gap-2",
			children: SCRAPED_SOURCES.map(({ key, label }) => /* @__PURE__ */ jsx(Toggle$1, {
				pressed: !!scrapedSource?.includes(key),
				onPressedChange: () => toggleSource(key),
				variant: "outline",
				className: PILL_CLASS$1,
				children: label
			}, key))
		})] })]
	});
}
//#endregion
//#region src/modules/explore/ui/FiltersSheet.tsx
var PILL_CLASS = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
function FiltersSheet(props) {
	const { t } = useTranslation();
	const txOptions = props.category === "service" ? [{
		value: "hire",
		label: t("landing.hire", "Hire")
	}] : [{
		value: "buy",
		label: t("filters.sale", "Buy")
	}, {
		value: "rent",
		label: t("filters.rent", "Rent")
	}];
	const categoryLabel = props.category === "property" ? t("filters.propertyDetails", "Property details") : props.category === "vehicle" ? t("filters.vehicleDetails", "Vehicle details") : props.category === "service" ? t("filters.serviceDetails", "Service details") : props.category === "experience" ? t("filters.experienceDetails", "Experience details") : null;
	const defaultOpen = [
		"type",
		"price",
		"source"
	];
	if (categoryLabel) defaultOpen.push("category");
	return /* @__PURE__ */ jsx(Sheet, {
		open: props.open,
		onOpenChange: (o) => !o && props.onClose(),
		children: /* @__PURE__ */ jsxs(SheetContent, {
			side: "right",
			showCloseButton: false,
			className: "flex w-full flex-col gap-0 p-0 sm:max-w-md",
			children: [
				/* @__PURE__ */ jsx(SheetHeader, {
					className: "border-b border-border px-6 py-5",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsxs(SheetTitle, {
							className: "font-display text-base font-medium",
							children: [t("filters.filters", "Filters"), props.activeFilterCount > 0 && /* @__PURE__ */ jsx("span", {
								className: "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-medium text-background",
								children: props.activeFilterCount
							})]
						}), /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							onClick: props.onClose,
							className: "h-8 w-8 rounded-full",
							"aria-label": "Close filters",
							children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
						})]
					})
				}),
				/* @__PURE__ */ jsx(ScrollArea$1, {
					className: "flex-1",
					children: /* @__PURE__ */ jsx("div", {
						className: "px-6 py-2",
						children: /* @__PURE__ */ jsxs(Accordion$1, {
							type: "multiple",
							defaultValue: defaultOpen,
							className: "w-full",
							children: [
								/* @__PURE__ */ jsxs(AccordionItem, {
									value: "type",
									children: [/* @__PURE__ */ jsx(AccordionTrigger, { children: t("filters.type", "Type") }), /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsx("div", {
										className: "flex flex-wrap gap-2 pt-2",
										children: txOptions.map((opt) => /* @__PURE__ */ jsx(Toggle$1, {
											pressed: props.transactionType === opt.value,
											onPressedChange: () => props.onTransactionTypeChange(props.transactionType === opt.value ? null : opt.value),
											variant: "outline",
											className: PILL_CLASS,
											children: opt.label
										}, opt.value))
									}) })]
								}),
								/* @__PURE__ */ jsxs(AccordionItem, {
									value: "price",
									children: [/* @__PURE__ */ jsx(AccordionTrigger, { children: t("filters.priceRange", "Price range") }), /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-3 pt-2",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex-1",
												children: [/* @__PURE__ */ jsx("p", {
													className: "mb-1 text-xs text-muted-foreground",
													children: t("filters.min", "Min")
												}), /* @__PURE__ */ jsx(Input, {
													type: "number",
													placeholder: "0 DKK",
													value: props.priceMin ?? "",
													onChange: (e) => props.onPriceMinChange(e.target.value ? Number(e.target.value) : null)
												})]
											}),
											/* @__PURE__ */ jsx("span", {
												className: "mt-5 text-muted-foreground",
												children: "–"
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "flex-1",
												children: [/* @__PURE__ */ jsx("p", {
													className: "mb-1 text-xs text-muted-foreground",
													children: t("filters.max", "Max")
												}), /* @__PURE__ */ jsx(Input, {
													type: "number",
													placeholder: "∞ DKK",
													value: props.priceMax ?? "",
													onChange: (e) => props.onPriceMaxChange(e.target.value ? Number(e.target.value) : null)
												})]
											})
										]
									}) })]
								}),
								/* @__PURE__ */ jsxs(AccordionItem, {
									value: "source",
									children: [/* @__PURE__ */ jsx(AccordionTrigger, { children: t("filters.source", "Source") }), /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsx("div", {
										className: "pt-2",
										children: /* @__PURE__ */ jsx(SourceFilter, {
											sourceKind: props.sourceKind,
											scrapedSource: props.scrapedSource,
											onSourceKindChange: props.onSourceKindChange,
											onScrapedSourceChange: props.onScrapedSourceChange
										})
									}) })]
								}),
								categoryLabel && /* @__PURE__ */ jsxs(AccordionItem, {
									value: "category",
									children: [/* @__PURE__ */ jsx(AccordionTrigger, { children: categoryLabel }), /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsxs("div", {
										className: "pt-2",
										children: [
											props.category === "property" && /* @__PURE__ */ jsx(PropertyFilters, {
												subCategory: props.subCategory,
												beds: props.beds,
												baths: props.baths,
												areaMin: props.areaMin,
												areaMax: props.areaMax,
												yearBuiltMin: props.yearBuiltMin,
												yearBuiltMax: props.yearBuiltMax,
												parkingMin: props.parkingMin,
												furnished: props.furnished,
												onSubCategoryChange: props.onSubCategoryChange,
												onBedsChange: props.onBedsChange,
												onBathsChange: props.onBathsChange,
												onAreaMinChange: props.onAreaMinChange,
												onAreaMaxChange: props.onAreaMaxChange,
												onYearBuiltMinChange: props.onYearBuiltMinChange,
												onYearBuiltMaxChange: props.onYearBuiltMaxChange,
												onParkingMinChange: props.onParkingMinChange,
												onFurnishedChange: props.onFurnishedChange
											}),
											props.category === "vehicle" && /* @__PURE__ */ jsx(VehicleFilters, {
												subCategory: props.subCategory,
												make: props.make,
												yearMin: props.yearMin,
												yearMax: props.yearMax,
												fuelType: props.fuelType,
												transmission: props.transmission,
												mileageMax: props.mileageMax,
												doorsMin: props.doorsMin,
												colors: props.colors,
												onSubCategoryChange: props.onSubCategoryChange,
												onMakeChange: props.onMakeChange,
												onYearMinChange: props.onYearMinChange,
												onYearMaxChange: props.onYearMaxChange,
												onFuelTypeChange: props.onFuelTypeChange,
												onTransmissionChange: props.onTransmissionChange,
												onMileageMaxChange: props.onMileageMaxChange,
												onDoorsMinChange: props.onDoorsMinChange,
												onColorsChange: props.onColorsChange
											}),
											props.category === "service" && /* @__PURE__ */ jsx(ServiceFilters, {
												subCategory: props.subCategory,
												experienceMin: props.experienceMin,
												serviceRadiusMin: props.serviceRadiusMin,
												responseTime: props.responseTime,
												certified: props.certified,
												onSubCategoryChange: props.onSubCategoryChange,
												onExperienceMinChange: props.onExperienceMinChange,
												onServiceRadiusMinChange: props.onServiceRadiusMinChange,
												onResponseTimeChange: props.onResponseTimeChange,
												onCertifiedChange: props.onCertifiedChange
											}),
											props.category === "experience" && /* @__PURE__ */ jsx(ExperienceFilters, {
												subCategory: props.subCategory,
												durationMin: props.durationMin,
												durationMax: props.durationMax,
												groupMax: props.groupMax,
												minAgeMax: props.minAgeMax,
												languages: props.languages,
												difficulty: props.difficulty,
												onSubCategoryChange: props.onSubCategoryChange,
												onDurationMinChange: props.onDurationMinChange,
												onDurationMaxChange: props.onDurationMaxChange,
												onGroupMaxChange: props.onGroupMaxChange,
												onMinAgeMaxChange: props.onMinAgeMaxChange,
												onLanguagesChange: props.onLanguagesChange,
												onDifficultyChange: props.onDifficultyChange
											})
										]
									}) })]
								})
							]
						})
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-t border-border px-6 py-4",
					children: [/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						onClick: props.onClearAll,
						className: "text-sm text-muted-foreground",
						children: t("filters.clearAll", "Clear all")
					}), /* @__PURE__ */ jsx(Button, {
						onClick: props.onClose,
						className: "rounded-full px-6",
						children: t("filters.showResults", { count: props.total })
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/modules/listings/ui/ListingList.tsx
var cardVariants = {
	hidden: {
		opacity: 0,
		y: 10
	},
	visible: (i) => ({
		opacity: 1,
		y: 0,
		transition: {
			delay: i * .04,
			duration: .3
		}
	})
};
function ListingList({ items, isLoading, isError, isFetchingNextPage, hasNextPage, onLoadMore, activeId, onSelect, onFavorite, favoriteIds, layout = "list" }) {
	const { t } = useTranslation();
	const sentinelRef = useRef(null);
	useEffect(() => {
		if (!sentinelRef.current || !hasNextPage) return;
		let scrollParent = sentinelRef.current.parentElement;
		while (scrollParent) {
			const style = getComputedStyle(scrollParent);
			if (style.overflowY === "auto" || style.overflowY === "scroll" || style.overflow === "auto" || style.overflow === "scroll") break;
			scrollParent = scrollParent.parentElement;
		}
		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) onLoadMore();
		}, {
			root: scrollParent,
			rootMargin: "400px"
		});
		observer.observe(sentinelRef.current);
		return () => observer.disconnect();
	}, [
		hasNextPage,
		isFetchingNextPage,
		onLoadMore
	]);
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: layout === "grid" ? "grid gap-2 p-3 [grid-template-columns:repeat(auto-fill,minmax(148px,1fr))]" : "flex flex-col gap-0 p-0",
		children: Array.from({ length: layout === "grid" ? 8 : 6 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: layout === "grid" ? "aspect-[3/4] w-full rounded-xl" : "h-28 w-full rounded-xl" }, i))
	});
	if (isError) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center gap-3 p-8 text-center",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-muted-foreground",
			children: t("property.errorLoading", "Could not load listings")
		}), /* @__PURE__ */ jsx(Button, {
			variant: "outline",
			size: "sm",
			onClick: onLoadMore,
			children: t("common.retry", "Retry")
		})]
	});
	if (items.length === 0) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center gap-2 p-8 text-center",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-muted-foreground",
			children: t("property.noResults", "No listings found")
		}), /* @__PURE__ */ jsx("p", {
			className: "text-sm text-muted-foreground",
			children: t("property.tryAdjustingFilters", "Try adjusting your filters")
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: layout === "grid" ? "grid grid-cols-2 gap-3 p-4 sm:grid-cols-3" : "flex flex-col gap-3 p-4",
		children: [
			/* @__PURE__ */ jsx(AnimatePresence, {
				mode: "popLayout",
				children: items.map((item, i) => /* @__PURE__ */ jsx(m.div, {
					custom: i,
					variants: cardVariants,
					initial: "hidden",
					animate: "visible",
					exit: {
						opacity: 0,
						scale: .95
					},
					layout: true,
					children: /* @__PURE__ */ jsx(ListingCard, {
						item,
						isActive: activeId === item.id,
						isFavorite: favoriteIds?.has(item.id),
						onSelect: () => onSelect(item.id),
						onFavorite: onFavorite ? () => onFavorite(item.id) : void 0,
						variant: layout === "grid" ? "compact" : "default"
					})
				}, item.id))
			}),
			/* @__PURE__ */ jsx("div", {
				ref: sentinelRef,
				className: "col-span-full h-1"
			}),
			isFetchingNextPage && /* @__PURE__ */ jsx("div", {
				className: layout === "grid" ? "col-span-full flex flex-col gap-3" : "flex flex-col gap-3",
				children: Array.from({ length: layout === "grid" ? 4 : 3 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: layout === "grid" ? "aspect-4/5 w-full" : "h-28 w-full rounded-xl" }, `loading-${i}`))
			})
		]
	});
}
//#endregion
//#region src/modules/explore/ui/ExplorePage.tsx
/** Shape-level reset shared by category-change and clear-all. */
var FILTER_RESET = {
	subCategory: null,
	transactionType: null,
	sourceKind: null,
	scrapedSource: null,
	beds: null,
	baths: null,
	areaMin: null,
	areaMax: null,
	yearBuiltMin: null,
	yearBuiltMax: null,
	parkingMin: null,
	furnished: null,
	make: null,
	yearMin: null,
	yearMax: null,
	fuelType: null,
	transmission: null,
	mileageMax: null,
	doorsMin: null,
	colors: null,
	experienceMin: null,
	serviceRadiusMin: null,
	responseTime: null,
	certified: null,
	durationMin: null,
	durationMax: null,
	groupMax: null,
	minAgeMax: null,
	languages: null,
	difficulty: null,
	nearLat: null,
	nearLng: null,
	nearRadius: null,
	polygon: null,
	page: 1
};
function ExplorePage() {
	const { t, i18n } = useTranslation();
	const [params, setParams] = useQueryStates(exploreParsers);
	const [bounds, setBounds] = useState(null);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [mobileView, setMobileView] = useState("list");
	const boundsTimerRef = useRef(null);
	const filters = useMemo(() => ({
		category: params.category ?? void 0,
		subCategory: params.subCategory?.length ? params.subCategory : void 0,
		transactionType: params.transactionType ?? void 0,
		query: params.q || void 0,
		priceMin: params.priceMin ?? void 0,
		priceMax: params.priceMax ?? void 0,
		bounds: bounds ?? void 0,
		sort: params.sort,
		locale: i18n.language,
		sourceKind: params.sourceKind ?? void 0,
		scrapedSource: params.scrapedSource?.length ? params.scrapedSource : void 0,
		bedrooms: params.beds?.map((b) => b === "studio" ? "studio" : Number(b)) ?? void 0,
		bathrooms: params.baths ?? void 0,
		areaMin: params.areaMin ?? void 0,
		areaMax: params.areaMax ?? void 0,
		yearBuiltMin: params.yearBuiltMin ?? void 0,
		yearBuiltMax: params.yearBuiltMax ?? void 0,
		parkingMin: params.parkingMin ?? void 0,
		furnished: params.furnished ?? void 0,
		make: params.make?.length ? params.make : void 0,
		yearMin: params.yearMin ?? void 0,
		yearMax: params.yearMax ?? void 0,
		fuelType: params.fuelType?.length ? params.fuelType : void 0,
		transmission: params.transmission ?? void 0,
		mileageMax: params.mileageMax ?? void 0,
		doorsMin: params.doorsMin ?? void 0,
		colors: params.colors?.length ? params.colors : void 0,
		experienceMin: params.experienceMin ?? void 0,
		serviceRadiusMin: params.serviceRadiusMin ?? void 0,
		responseTime: params.responseTime ?? void 0,
		certified: params.certified ?? void 0,
		durationMin: params.durationMin ?? void 0,
		durationMax: params.durationMax ?? void 0,
		groupMax: params.groupMax ?? void 0,
		minAgeMax: params.minAgeMax ?? void 0,
		languages: params.languages?.length ? params.languages : void 0,
		difficulty: params.difficulty ?? void 0,
		nearLat: params.nearLat ?? void 0,
		nearLng: params.nearLng ?? void 0,
		nearRadiusKm: params.nearRadius ?? void 0,
		polygon: params.polygon ?? void 0
	}), [
		params.category,
		params.subCategory,
		params.transactionType,
		params.q,
		params.priceMin,
		params.priceMax,
		params.sort,
		params.sourceKind,
		params.scrapedSource,
		params.beds,
		params.baths,
		params.areaMin,
		params.areaMax,
		params.yearBuiltMin,
		params.yearBuiltMax,
		params.parkingMin,
		params.furnished,
		params.make,
		params.yearMin,
		params.yearMax,
		params.fuelType,
		params.transmission,
		params.mileageMax,
		params.doorsMin,
		params.colors,
		params.experienceMin,
		params.serviceRadiusMin,
		params.responseTime,
		params.certified,
		params.durationMin,
		params.durationMax,
		params.groupMax,
		params.minAgeMax,
		params.languages,
		params.difficulty,
		params.nearLat,
		params.nearLng,
		params.nearRadius,
		params.polygon,
		bounds,
		i18n.language
	]);
	const { data, isPending, isError, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
		...listingInfiniteQueryOptions({
			...filters,
			pageSize: 20
		}),
		placeholderData: keepPreviousData
	});
	const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
	const total = data?.pages[0]?.total ?? 0;
	const { data: markers = [] } = useQuery({
		...mapMarkersQueryOptions(useMemo(() => ({
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
			polygon: filters.polygon
		}), [
			filters.category,
			filters.subCategory,
			filters.transactionType,
			filters.priceMin,
			filters.priceMax,
			filters.sourceKind,
			filters.scrapedSource,
			filters.bedrooms,
			filters.bathrooms,
			filters.areaMin,
			filters.areaMax,
			filters.yearBuiltMin,
			filters.yearBuiltMax,
			filters.parkingMin,
			filters.furnished,
			filters.make,
			filters.yearMin,
			filters.yearMax,
			filters.fuelType,
			filters.transmission,
			filters.mileageMax,
			filters.doorsMin,
			filters.colors,
			filters.experienceMin,
			filters.serviceRadiusMin,
			filters.responseTime,
			filters.certified,
			filters.durationMin,
			filters.durationMax,
			filters.groupMax,
			filters.minAgeMax,
			filters.languages,
			filters.difficulty,
			filters.nearLat,
			filters.nearLng,
			filters.nearRadiusKm,
			filters.polygon
		])),
		placeholderData: keepPreviousData
	});
	const handleBoundsChange = useCallback((newBounds) => {
		if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
		boundsTimerRef.current = setTimeout(() => {
			setBounds(newBounds);
		}, 600);
	}, []);
	const handleCategoryChange = (cat) => {
		setParams({
			...FILTER_RESET,
			category: cat
		});
	};
	const activeFilterCount = useMemo(() => {
		return [
			params.priceMin != null,
			params.priceMax != null,
			!!params.subCategory?.length,
			!!params.transactionType,
			!!params.sourceKind,
			!!params.scrapedSource?.length,
			!!params.beds?.length,
			params.baths != null,
			params.areaMin != null,
			params.areaMax != null,
			params.yearBuiltMin != null,
			params.yearBuiltMax != null,
			params.parkingMin != null,
			params.furnished === true,
			!!params.make?.length,
			params.yearMin != null,
			params.yearMax != null,
			!!params.fuelType?.length,
			!!params.transmission,
			params.mileageMax != null,
			params.doorsMin != null,
			!!params.colors?.length,
			params.experienceMin != null,
			params.serviceRadiusMin != null,
			!!params.responseTime,
			params.certified === true,
			params.durationMin != null,
			params.durationMax != null,
			params.groupMax != null,
			params.minAgeMax != null,
			!!params.languages?.length,
			!!params.difficulty
		].filter(Boolean).length;
	}, [params]);
	const handleClearAll = () => {
		setParams({
			...FILTER_RESET,
			priceMin: null,
			priceMax: null
		});
	};
	const area = useMemo(() => {
		if (params.nearLat != null && params.nearLng != null && params.nearRadius != null) return {
			type: "radius",
			lat: params.nearLat,
			lng: params.nearLng,
			radiusKm: params.nearRadius
		};
		const poly = decodePolygon(params.polygon);
		if (poly) return {
			type: "polygon",
			ring: poly
		};
		return null;
	}, [
		params.nearLat,
		params.nearLng,
		params.nearRadius,
		params.polygon
	]);
	const handleAreaChange = useCallback((next) => {
		if (!next) {
			setParams({
				nearLat: null,
				nearLng: null,
				nearRadius: null,
				polygon: null,
				page: 1
			});
			return;
		}
		if (next.type === "radius") {
			setParams({
				nearLat: next.lat,
				nearLng: next.lng,
				nearRadius: next.radiusKm,
				polygon: null,
				page: 1
			});
			return;
		}
		setParams({
			nearLat: null,
			nearLng: null,
			nearRadius: null,
			polygon: encodePolygon(next.ring),
			page: 1
		});
	}, [setParams]);
	const sharedFilterProps = {
		category: params.category,
		transactionType: params.transactionType,
		priceMin: params.priceMin,
		priceMax: params.priceMax,
		sourceKind: params.sourceKind,
		scrapedSource: params.scrapedSource,
		beds: params.beds,
		baths: params.baths,
		areaMin: params.areaMin,
		areaMax: params.areaMax,
		yearBuiltMin: params.yearBuiltMin,
		yearBuiltMax: params.yearBuiltMax,
		parkingMin: params.parkingMin,
		furnished: params.furnished,
		make: params.make,
		yearMin: params.yearMin,
		yearMax: params.yearMax,
		fuelType: params.fuelType,
		transmission: params.transmission,
		mileageMax: params.mileageMax,
		doorsMin: params.doorsMin,
		colors: params.colors,
		experienceMin: params.experienceMin,
		serviceRadiusMin: params.serviceRadiusMin,
		responseTime: params.responseTime,
		certified: params.certified,
		durationMin: params.durationMin,
		durationMax: params.durationMax,
		groupMax: params.groupMax,
		minAgeMax: params.minAgeMax,
		languages: params.languages,
		difficulty: params.difficulty,
		subCategory: params.subCategory,
		onTransactionTypeChange: (v) => setParams({
			transactionType: v,
			page: 1
		}),
		onPriceMinChange: (v) => setParams({
			priceMin: v,
			page: 1
		}),
		onPriceMaxChange: (v) => setParams({
			priceMax: v,
			page: 1
		}),
		onSourceKindChange: (v) => setParams({
			sourceKind: v,
			scrapedSource: v === "user" ? null : params.scrapedSource,
			page: 1
		}),
		onScrapedSourceChange: (v) => setParams({
			scrapedSource: v,
			page: 1
		}),
		onBedsChange: (v) => setParams({
			beds: v,
			page: 1
		}),
		onBathsChange: (v) => setParams({
			baths: v,
			page: 1
		}),
		onAreaMinChange: (v) => setParams({
			areaMin: v,
			page: 1
		}),
		onAreaMaxChange: (v) => setParams({
			areaMax: v,
			page: 1
		}),
		onYearBuiltMinChange: (v) => setParams({
			yearBuiltMin: v,
			page: 1
		}),
		onYearBuiltMaxChange: (v) => setParams({
			yearBuiltMax: v,
			page: 1
		}),
		onParkingMinChange: (v) => setParams({
			parkingMin: v,
			page: 1
		}),
		onFurnishedChange: (v) => setParams({
			furnished: v,
			page: 1
		}),
		onSubCategoryChange: (v) => setParams({
			subCategory: v,
			page: 1
		}),
		onMakeChange: (v) => setParams({
			make: v,
			page: 1
		}),
		onYearMinChange: (v) => setParams({
			yearMin: v,
			page: 1
		}),
		onYearMaxChange: (v) => setParams({
			yearMax: v,
			page: 1
		}),
		onFuelTypeChange: (v) => setParams({
			fuelType: v,
			page: 1
		}),
		onTransmissionChange: (v) => setParams({
			transmission: v,
			page: 1
		}),
		onMileageMaxChange: (v) => setParams({
			mileageMax: v,
			page: 1
		}),
		onDoorsMinChange: (v) => setParams({
			doorsMin: v,
			page: 1
		}),
		onColorsChange: (v) => setParams({
			colors: v,
			page: 1
		}),
		onExperienceMinChange: (v) => setParams({
			experienceMin: v,
			page: 1
		}),
		onServiceRadiusMinChange: (v) => setParams({
			serviceRadiusMin: v,
			page: 1
		}),
		onResponseTimeChange: (v) => setParams({
			responseTime: v,
			page: 1
		}),
		onCertifiedChange: (v) => setParams({
			certified: v,
			page: 1
		}),
		onDurationMinChange: (v) => setParams({
			durationMin: v,
			page: 1
		}),
		onDurationMaxChange: (v) => setParams({
			durationMax: v,
			page: 1
		}),
		onGroupMaxChange: (v) => setParams({
			groupMax: v,
			page: 1
		}),
		onMinAgeMaxChange: (v) => setParams({
			minAgeMax: v,
			page: 1
		}),
		onLanguagesChange: (v) => setParams({
			languages: v,
			page: 1
		}),
		onDifficultyChange: (v) => setParams({
			difficulty: v,
			page: 1
		}),
		onClearAll: handleClearAll
	};
	const { ids: favoriteIds, toggle: toggleFavorite } = useFavorites();
	const listingGrid = /* @__PURE__ */ jsx(ListingList, {
		items,
		isLoading: isPending,
		isError,
		isFetchingNextPage,
		hasNextPage: hasNextPage ?? false,
		onLoadMore: () => fetchNextPage(),
		activeId: params.listingId,
		onSelect: (id) => setParams({ listingId: id }),
		total,
		layout: "grid",
		onFavorite: toggleFavorite,
		favoriteIds
	});
	const mapView = /* @__PURE__ */ jsx(MapView, {
		markers,
		items,
		activeId: params.listingId,
		onSelect: (id) => setParams({ listingId: id }),
		onBoundsChange: handleBoundsChange,
		center: params.lat != null && params.lng != null ? [params.lng, params.lat] : void 0,
		zoom: params.zoom ?? void 0,
		area,
		onAreaChange: handleAreaChange,
		defaultRadiusKm: 5
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ jsx(ExploreTopBar, {
				category: params.category,
				onCategoryChange: handleCategoryChange,
				sort: params.sort,
				onSortChange: (sort) => setParams({
					sort,
					page: 1
				}),
				total,
				activeFilterCount,
				onFiltersOpen: () => setFiltersOpen(true),
				query: params.q,
				onQueryChange: (q) => setParams({
					q: q || null,
					page: 1
				}),
				transactionType: params.transactionType,
				priceMin: params.priceMin,
				priceMax: params.priceMax,
				beds: params.beds,
				baths: params.baths,
				areaMin: params.areaMin,
				areaMax: params.areaMax,
				make: params.make,
				yearMin: params.yearMin,
				fuelType: params.fuelType,
				transmission: params.transmission,
				experienceMin: params.experienceMin,
				subCategory: params.subCategory,
				onSubCategoryChange: (v) => setParams({
					subCategory: v,
					page: 1
				}),
				onTransactionTypeChange: (v) => setParams({
					transactionType: v,
					page: 1
				}),
				onPriceMinChange: (v) => setParams({
					priceMin: v,
					page: 1
				}),
				onPriceMaxChange: (v) => setParams({
					priceMax: v,
					page: 1
				}),
				onBedsChange: (v) => setParams({
					beds: v,
					page: 1
				}),
				onBathsChange: (v) => setParams({
					baths: v,
					page: 1
				}),
				onAreaMinChange: (v) => setParams({
					areaMin: v,
					page: 1
				}),
				onAreaMaxChange: (v) => setParams({
					areaMax: v,
					page: 1
				}),
				onMakeChange: (v) => setParams({
					make: v,
					page: 1
				}),
				onYearMinChange: (v) => setParams({
					yearMin: v,
					page: 1
				}),
				onFuelTypeChange: (v) => setParams({
					fuelType: v,
					page: 1
				}),
				onTransmissionChange: (v) => setParams({
					transmission: v,
					page: 1
				}),
				onExperienceMinChange: (v) => setParams({
					experienceMin: v,
					page: 1
				}),
				onClearAll: handleClearAll
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative flex min-h-0 flex-1",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "hidden w-[45%] min-w-90 overflow-y-auto lg:block",
						children: listingGrid
					}),
					/* @__PURE__ */ jsx("div", {
						className: "hidden flex-1 lg:block",
						children: mapView
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-1 flex-col lg:hidden",
						children: [/* @__PURE__ */ jsx(AnimatePresence, {
							mode: "wait",
							children: mobileView === "list" ? /* @__PURE__ */ jsx(m.div, {
								initial: { opacity: 0 },
								animate: { opacity: 1 },
								exit: { opacity: 0 },
								transition: { duration: .2 },
								className: "flex-1 overflow-y-auto",
								children: listingGrid
							}, "mobile-list") : /* @__PURE__ */ jsx(m.div, {
								initial: { opacity: 0 },
								animate: { opacity: 1 },
								exit: { opacity: 0 },
								transition: { duration: .2 },
								className: "flex-1",
								children: mapView
							}, "mobile-map")
						}), /* @__PURE__ */ jsx("div", {
							className: "absolute bottom-4 left-1/2 z-10 -translate-x-1/2",
							children: /* @__PURE__ */ jsx(Button, {
								variant: "default",
								size: "sm",
								className: "rounded-full shadow-lg",
								onClick: () => setMobileView((v) => v === "list" ? "map" : "list"),
								children: mobileView === "list" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Map, { className: "mr-1.5 h-3.5 w-3.5" }), t("explore.showMap", "Show map")] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
									/* @__PURE__ */ jsx(List, { className: "mr-1.5 h-3.5 w-3.5" }),
									total.toLocaleString(),
									" ",
									t("property.resultCount", "results")
								] })
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx(FiltersSheet, {
				open: filtersOpen,
				onClose: () => setFiltersOpen(false),
				total,
				activeFilterCount,
				...sharedFilterProps
			})
		]
	});
}
//#endregion
//#region src/routes/_public/explore.tsx?tsr-split=component
var SplitComponent = ExplorePage;
//#endregion
export { SplitComponent as component };
