import { n as encodePolygon, t as decodePolygon } from "./spatial-BwBIKsRR.js";
import { t as cn } from "./utils-C98NY0TH.js";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip$1 } from "./tooltip-DDd0DgHJ.js";
import { t as Badge } from "./badge-CU7K8A-s.js";
import { t as Button } from "./button-DX0eJ04i.js";
import { t as Skeleton } from "./skeleton-ePPLs61V.js";
import { t as Input } from "./input-DIdDhyf2.js";
import { t as Separator$1 } from "./separator-C7fmWKHk.js";
import { i as VEHICLE_SUBCATEGORIES, t as EXPERIENCE_SUBCATEGORIES } from "./types-5CiJ0onh.js";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu$1 } from "./dropdown-menu-CIGqjYoW.js";
import { i as formatListingPrice, r as EDITORIAL_EASE, t as CATEGORY_ACCENT_VAR } from "./display-wPMPnOaq.js";
import { i as mapMarkersQueryOptions, r as listingInfiniteQueryOptions } from "./queries-C9jbt2hB.js";
import { n as toggleVariants, t as Toggle$1 } from "./toggle-BofjlVnc.js";
import { i as SheetTitle, n as SheetContent, o as useTheme, r as SheetHeader, t as Sheet } from "./sheet-Hy7N214o.js";
import * as React$1 from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { createPortal } from "react-dom";
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AnimatePresence, m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Popover, ScrollArea, ToggleGroup } from "radix-ui";
import { ArrowRight, ArrowUpDown, Award, Bath, Bed, Calendar, Car, Check, Clock, Compass, ExternalLink, Fuel, Gauge, Heart, Hexagon, Home, Layers, List, LocateFixed, Map, MapPin, Maximize, Minus, Mountain, MousePointerClick, ParkingCircle, Plus, Settings, SlidersHorizontal, Sparkles, Users, Wrench, X, Zap } from "lucide-react";
import { parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import maplibregl from "maplibre-gl";
//#region src/modules/explore/state/search-params.ts
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
	experienceMin: parseAsInteger
};
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
				children: /* @__PURE__ */ jsx(Button, {
					type: "button",
					size: "icon",
					variant: "ghost",
					className: "h-8 w-8 hover:bg-accent hover:text-accent-foreground",
					"aria-label": t("map.style", "Map style"),
					children: /* @__PURE__ */ jsx(Layers, {
						className: "h-3.5 w-3.5",
						strokeWidth: 1.75
					})
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
function MapView({ markers, items, activeId, onSelect, onBoundsChange, center, zoom, area = null, onAreaChange, defaultRadiusKm = 5 }) {
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
			zoom: zoom ?? DEFAULT_ZOOM
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
			/* @__PURE__ */ jsx(MapToolbar, {
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
			/* @__PURE__ */ jsx("div", {
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
//#region src/modules/explore/filters/PropertyFilters.tsx
var BED_OPTIONS = [
	"studio",
	"1",
	"2",
	"3",
	"4",
	"5+"
];
/** Shared Toggle pill classes for active/inactive editorial style */
var PILL_CLASS$3 = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
/** Section label — uppercase editorial style */
function SectionLabel$1({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
		children
	});
}
function PropertyFilters({ beds, baths, areaMin, areaMax, onBedsChange, onBathsChange, onAreaMinChange, onAreaMaxChange }) {
	const { t } = useTranslation();
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
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.bedrooms", "Bedrooms") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: BED_OPTIONS.map((opt) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!beds?.includes(opt),
					onPressedChange: () => toggleBed(opt),
					variant: "outline",
					className: PILL_CLASS$3,
					children: opt === "studio" ? t("filters.studio", "Studio") : opt
				}, opt))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.bathrooms", "Bathrooms") }), /* @__PURE__ */ jsx("div", {
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
					className: PILL_CLASS$3,
					children: [n, "+"]
				}, n))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel$1, { children: t("filters.area", "Area (m²)") }), /* @__PURE__ */ jsxs("div", {
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
			})] })
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
var PILL_CLASS$2 = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
function SectionLabel({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
		children
	});
}
function VehicleFilters({ subCategory, make, yearMin, yearMax, fuelType, transmission, onSubCategoryChange, onMakeChange, onYearMinChange, onYearMaxChange, onFuelTypeChange, onTransmissionChange }) {
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
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel, { children: t("filters.vehicleType", "Vehicle type") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: VEHICLE_SUBCATEGORIES.map((val) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!subCategory?.includes(val),
					onPressedChange: () => toggleSubCat(val),
					variant: "outline",
					className: PILL_CLASS$2,
					children: t(`filters.subcat_${val}`, val)
				}, val))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel, { children: t("filters.make", "Make") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: POPULAR_MAKES.map((m) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!make?.includes(m),
					onPressedChange: () => toggleMake(m),
					variant: "outline",
					className: PILL_CLASS$2,
					children: m
				}, m))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel, { children: t("filters.year", "Year") }), /* @__PURE__ */ jsxs("div", {
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
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel, { children: t("filters.fuelType", "Fuel Type") }), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: FUEL_OPTIONS.map(({ value, label }) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: !!fuelType?.includes(value),
					onPressedChange: () => toggleFuel(value),
					variant: "outline",
					className: PILL_CLASS$2,
					children: label
				}, value))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(SectionLabel, { children: t("filters.transmission", "Transmission") }), /* @__PURE__ */ jsx("div", {
				className: "flex gap-2",
				children: ["manual", "automatic"].map((val) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: transmission === val,
					onPressedChange: () => onTransmissionChange(transmission === val ? null : val),
					variant: "outline",
					className: PILL_CLASS$2,
					children: val === "manual" ? t("filters.manual", "Manual") : t("filters.automatic", "Automatic")
				}, val))
			})] })
		]
	});
}
//#endregion
//#region src/modules/explore/filters/ServiceFilters.tsx
var PILL_CLASS$1 = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
function ServiceFilters({ experienceMin, onExperienceMinChange }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsx("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
			className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
			children: t("filters.experience", "Min. Experience")
		}), /* @__PURE__ */ jsx("div", {
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
				className: PILL_CLASS$1,
				children: [
					yr,
					"+ ",
					t("filters.years", "yrs")
				]
			}, yr))
		})] })
	});
}
//#endregion
//#region src/modules/explore/filters/ExperienceFilters.tsx
var PILL_CLASS = "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";
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
		label: "Up to 2h",
		value: 2
	},
	{
		label: "Up to 4h",
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
function ExperienceFilters({ subCategory, maxGuests, durationMax, onSubCategoryChange, onMaxGuestsChange, onDurationMaxChange }) {
	const { t } = useTranslation();
	function toggleSubCategory(val) {
		const current = subCategory ?? [];
		const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
		onSubCategoryChange(next.length > 0 ? next : null);
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
				children: t("filters.experienceType", "Experience type")
			}), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: EXPERIENCE_SUBCATEGORIES.map((sub) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: subCategory?.includes(sub) ?? false,
					onPressedChange: () => toggleSubCategory(sub),
					variant: "outline",
					className: PILL_CLASS,
					children: SUBCATEGORY_LABELS[sub] ?? sub
				}, sub))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
				children: t("filters.duration", "Duration")
			}), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: DURATION_OPTIONS.map((opt) => /* @__PURE__ */ jsx(Toggle$1, {
					pressed: durationMax === opt.value,
					onPressedChange: () => onDurationMaxChange(durationMax === opt.value ? null : opt.value),
					variant: "outline",
					className: PILL_CLASS,
					children: opt.label
				}, opt.value))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
				children: t("filters.groupSize", "Max group size")
			}), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-2",
				children: [
					2,
					5,
					10,
					20
				].map((n) => /* @__PURE__ */ jsxs(Toggle$1, {
					pressed: maxGuests === n,
					onPressedChange: () => onMaxGuestsChange(maxGuests === n ? null : n),
					variant: "outline",
					className: PILL_CLASS,
					children: [
						n === 20 ? "20+" : `≤${n}`,
						" ",
						t("filters.guests", "guests")
					]
				}, n))
			})] })
		]
	});
}
//#endregion
//#region src/modules/explore/ui/FiltersSheet.tsx
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
	return /* @__PURE__ */ jsx(Sheet, {
		open: props.open,
		onOpenChange: (o) => !o && props.onClose(),
		children: /* @__PURE__ */ jsxs(SheetContent, {
			side: "right",
			className: "flex w-full flex-col gap-0 p-0 sm:max-w-md",
			children: [
				/* @__PURE__ */ jsx(SheetHeader, {
					className: "border-b border-border px-6 py-5",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx(SheetTitle, {
							className: "font-display text-base font-medium",
							children: t("filters.filters", "Filters")
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
					children: /* @__PURE__ */ jsxs("div", {
						className: "space-y-6 px-6 py-5",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
								children: t("filters.type", "Type")
							}), /* @__PURE__ */ jsx("div", {
								className: "flex gap-2",
								children: txOptions.map((opt) => /* @__PURE__ */ jsx(Toggle$1, {
									pressed: props.transactionType === opt.value,
									onPressedChange: () => props.onTransactionTypeChange(props.transactionType === opt.value ? null : opt.value),
									variant: "outline",
									className: "rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background",
									children: opt.label
								}, opt.value))
							})] }),
							/* @__PURE__ */ jsx(Separator$1, {}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
								children: t("filters.priceRange", "Price Range")
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
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
							})] }),
							/* @__PURE__ */ jsxs(AnimatePresence, {
								mode: "wait",
								children: [
									props.category === "property" && /* @__PURE__ */ jsxs(m.div, {
										initial: {
											opacity: 0,
											y: 8
										},
										animate: {
											opacity: 1,
											y: 0
										},
										exit: {
											opacity: 0,
											y: -8
										},
										transition: { duration: .2 },
										children: [/* @__PURE__ */ jsx(Separator$1, { className: "mb-6" }), /* @__PURE__ */ jsx(PropertyFilters, {
											beds: props.beds,
											baths: props.baths,
											areaMin: props.areaMin,
											areaMax: props.areaMax,
											onBedsChange: props.onBedsChange,
											onBathsChange: props.onBathsChange,
											onAreaMinChange: props.onAreaMinChange,
											onAreaMaxChange: props.onAreaMaxChange
										})]
									}, "property"),
									props.category === "vehicle" && /* @__PURE__ */ jsxs(m.div, {
										initial: {
											opacity: 0,
											y: 8
										},
										animate: {
											opacity: 1,
											y: 0
										},
										exit: {
											opacity: 0,
											y: -8
										},
										transition: { duration: .2 },
										children: [/* @__PURE__ */ jsx(Separator$1, { className: "mb-6" }), /* @__PURE__ */ jsx(VehicleFilters, {
											subCategory: props.subCategory,
											make: props.make,
											yearMin: props.yearMin,
											yearMax: props.yearMax,
											fuelType: props.fuelType,
											transmission: props.transmission,
											onSubCategoryChange: props.onSubCategoryChange,
											onMakeChange: props.onMakeChange,
											onYearMinChange: props.onYearMinChange,
											onYearMaxChange: props.onYearMaxChange,
											onFuelTypeChange: props.onFuelTypeChange,
											onTransmissionChange: props.onTransmissionChange
										})]
									}, "vehicle"),
									props.category === "service" && /* @__PURE__ */ jsxs(m.div, {
										initial: {
											opacity: 0,
											y: 8
										},
										animate: {
											opacity: 1,
											y: 0
										},
										exit: {
											opacity: 0,
											y: -8
										},
										transition: { duration: .2 },
										children: [/* @__PURE__ */ jsx(Separator$1, { className: "mb-6" }), /* @__PURE__ */ jsx(ServiceFilters, {
											experienceMin: props.experienceMin,
											onExperienceMinChange: props.onExperienceMinChange
										})]
									}, "service"),
									props.category === "experience" && /* @__PURE__ */ jsxs(m.div, {
										initial: {
											opacity: 0,
											y: 8
										},
										animate: {
											opacity: 1,
											y: 0
										},
										exit: {
											opacity: 0,
											y: -8
										},
										transition: { duration: .2 },
										children: [/* @__PURE__ */ jsx(Separator$1, { className: "mb-6" }), /* @__PURE__ */ jsx(ExperienceFilters, {
											subCategory: props.subCategory,
											maxGuests: null,
											durationMax: null,
											onSubCategoryChange: props.onSubCategoryChange,
											onMaxGuestsChange: () => {},
											onDurationMaxChange: () => {}
										})]
									}, "experience")
								]
							})
						]
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
	beds: null,
	baths: null,
	areaMin: null,
	areaMax: null,
	make: null,
	yearMin: null,
	yearMax: null,
	fuelType: null,
	transmission: null,
	experienceMin: null,
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
		bedrooms: params.beds?.map((b) => b === "studio" ? "studio" : Number(b)) ?? void 0,
		bathrooms: params.baths ?? void 0,
		areaMin: params.areaMin ?? void 0,
		areaMax: params.areaMax ?? void 0,
		make: params.make?.length ? params.make : void 0,
		yearMin: params.yearMin ?? void 0,
		yearMax: params.yearMax ?? void 0,
		fuelType: params.fuelType?.length ? params.fuelType : void 0,
		transmission: params.transmission ?? void 0,
		experienceMin: params.experienceMin ?? void 0,
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
		params.beds,
		params.baths,
		params.areaMin,
		params.areaMax,
		params.make,
		params.yearMin,
		params.yearMax,
		params.fuelType,
		params.transmission,
		params.experienceMin,
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
			bedrooms: filters.bedrooms,
			bathrooms: filters.bathrooms,
			areaMin: filters.areaMin,
			areaMax: filters.areaMax,
			make: filters.make,
			yearMin: filters.yearMin,
			yearMax: filters.yearMax,
			fuelType: filters.fuelType,
			transmission: filters.transmission,
			experienceMin: filters.experienceMin,
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
			filters.bedrooms,
			filters.bathrooms,
			filters.areaMin,
			filters.areaMax,
			filters.make,
			filters.yearMin,
			filters.yearMax,
			filters.fuelType,
			filters.transmission,
			filters.experienceMin,
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
			!!params.beds?.length,
			params.baths != null,
			params.areaMin != null,
			params.areaMax != null,
			!!params.make?.length,
			params.yearMin != null,
			!!params.fuelType?.length,
			!!params.transmission,
			params.experienceMin != null
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
		beds: params.beds,
		baths: params.baths,
		areaMin: params.areaMin,
		areaMax: params.areaMax,
		make: params.make,
		yearMin: params.yearMin,
		yearMax: params.yearMax,
		fuelType: params.fuelType,
		transmission: params.transmission,
		experienceMin: params.experienceMin,
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
		onExperienceMinChange: (v) => setParams({
			experienceMin: v,
			page: 1
		}),
		onClearAll: handleClearAll
	};
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
		layout: "grid"
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
