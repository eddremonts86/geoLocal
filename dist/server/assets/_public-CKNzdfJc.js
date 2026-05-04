import { t as cn } from "./utils-C17k1q7P.js";
import { t as Button } from "./button-D7roF92S.js";
import { t as useFavorites } from "./useFavorites-Biw4cw7b.js";
import { t as Skeleton } from "./skeleton-CRJxhCYm.js";
import { i as formatListingPrice, n as CATEGORY_ICONS, r as EDITORIAL_EASE, t as CATEGORY_ACCENT_VAR } from "./display-cXPC5DSr.js";
import { t as Footer } from "./footer-BB_99IyQ.js";
import { a as featuredListingsQueryOptions, o as homeStatsQueryOptions, t as MapView, u as scrapedListingsQueryOptions } from "./MapView-DsIinqAq.js";
import * as React$1 from "react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ArrowUpRight, Car, Expand, ExternalLink, Heart, Home, Search, Sparkles, Wrench } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
//#region src/modules/landing/ui/HomeSearchBar.tsx
var CATEGORIES = [
	{
		id: "all",
		labelKey: "search.all",
		fallback: "All"
	},
	{
		id: "property",
		labelKey: "landing.properties",
		fallback: "Properties"
	},
	{
		id: "vehicle",
		labelKey: "landing.vehicles",
		fallback: "Vehicles"
	},
	{
		id: "service",
		labelKey: "landing.services",
		fallback: "Services"
	},
	{
		id: "experience",
		labelKey: "landing.experiences",
		fallback: "Experiences"
	}
];
/**
* Editorial search composer for the home hero. Renders a horizontal rail of
* category chips and a single free-text "where/what" input. Submit navigates
* to /explore. The composer is intentionally minimal — deep filtering happens
* inside Explore.
*/
function HomeSearchBar() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [category, setCategory] = useState("all");
	const [query, setQuery] = useState("");
	const handleSubmit = (e) => {
		e.preventDefault();
		const trimmed = query.trim();
		const search = {};
		if (category !== "all") search.category = category;
		if (trimmed.length > 0) search.q = trimmed;
		navigate({
			to: "/explore",
			search
		});
	};
	return /* @__PURE__ */ jsxs(m.form, {
		onSubmit: handleSubmit,
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .5,
			ease: EDITORIAL_EASE,
			delay: .32
		},
		className: "w-full",
		children: [/* @__PURE__ */ jsx("div", {
			className: "mb-3 flex flex-wrap items-center gap-1.5",
			children: CATEGORIES.map((c) => {
				const active = category === c.id;
				return /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setCategory(c.id),
					className: `meta-label rounded-none px-3 py-1.5 transition-colors ${active ? "bg-foreground text-background" : "border border-(--line-1) text-(--ink-2) hover:border-(--amber) hover:text-(--amber-ink)"}`,
					style: active ? {} : { borderColor: "var(--line-1)" },
					children: t(c.labelKey, c.fallback)
				}, c.id);
			})
		}), /* @__PURE__ */ jsxs("label", {
			htmlFor: "home-search-input",
			className: "flex items-center gap-3 border-y py-3",
			style: { borderColor: "var(--ink-1)" },
			children: [
				/* @__PURE__ */ jsx(Search, {
					className: "h-4 w-4 shrink-0",
					strokeWidth: 1.5,
					style: { color: "var(--ink-3)" }
				}),
				/* @__PURE__ */ jsx("input", {
					id: "home-search-input",
					type: "text",
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: t("search.placeholder", "Search by neighborhood, model, or keyword…"),
					className: "flex-1 bg-transparent text-base outline-none placeholder:text-(--ink-3) md:text-lg",
					style: { color: "var(--ink-1)" }
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "submit",
					className: "group inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-(--amber-ink)",
					style: { color: "var(--ink-1)" },
					children: [/* @__PURE__ */ jsx("span", {
						className: "meta-label hidden sm:inline",
						children: t("search.go", "Search")
					}), /* @__PURE__ */ jsx(ArrowRight, {
						className: "h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5",
						strokeWidth: 1.5
					})]
				})
			]
		})]
	});
}
//#endregion
//#region src/modules/landing/ui/HomeHero.tsx
function HomeHero() {
	const { t, i18n } = useTranslation();
	const { data } = useQuery(homeStatsQueryOptions(i18n.language));
	const markers = data?.heroMarkers?.filter((m) => m.latitude != null && m.longitude != null).map((m) => ({
		id: m.id,
		slug: m.slug,
		category: m.category,
		price: m.price,
		currency: m.currency,
		latitude: m.latitude,
		longitude: m.longitude
	})) ?? [];
	const stats = [
		{
			n: data?.total ?? 0,
			label: t("landing.stats.listings", "listings")
		},
		{
			n: 4,
			label: t("landing.stats.verticals", "verticals")
		},
		{
			n: data?.neighborhoods.length ?? 0,
			label: t("landing.stats.neighborhoods", "neighborhoods")
		}
	];
	return /* @__PURE__ */ jsxs("section", {
		className: "relative mx-auto max-w-[1400px] px-6 pb-14 pt-14 md:px-10 md:pb-20 md:pt-20 lg:pt-24",
		children: [/* @__PURE__ */ jsxs(m.div, {
			initial: {
				opacity: 0,
				y: 8
			},
			animate: {
				opacity: 1,
				y: 0
			},
			transition: {
				duration: .5,
				ease: EDITORIAL_EASE
			},
			className: "mb-10 flex flex-wrap items-baseline gap-4 md:gap-6",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "meta-label",
					children: t("editorial.established", "Copenhagen · Est. 2026")
				}),
				/* @__PURE__ */ jsx("div", { className: "hidden h-px flex-1 bg-border md:block" }),
				/* @__PURE__ */ jsx("div", {
					className: "flex items-baseline gap-4 md:gap-5",
					children: stats.map((s, i) => /* @__PURE__ */ jsxs("span", {
						className: "flex items-baseline gap-1.5",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-display text-sm font-medium tabular-nums",
							style: { color: "var(--ink-1)" },
							children: s.n.toLocaleString(i18n.language === "es" ? "es-ES" : "en-DK")
						}), /* @__PURE__ */ jsx("span", {
							className: "meta-label",
							style: { color: "var(--ink-3)" },
							children: s.label
						})]
					}, i))
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-12 gap-6 md:gap-10",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "col-span-12 lg:col-span-7",
				children: [
					/* @__PURE__ */ jsx(m.h1, {
						initial: {
							opacity: 0,
							y: 24
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .7,
							ease: EDITORIAL_EASE,
							delay: .08
						},
						className: "font-display text-[clamp(3rem,1.6rem+6vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.025em] text-foreground",
						children: t("landing.hero", "¿Qué estás buscando?")
					}),
					/* @__PURE__ */ jsx(m.p, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .6,
							ease: EDITORIAL_EASE,
							delay: .18
						},
						className: "mt-6 max-w-prose text-base leading-relaxed md:text-lg md:leading-[1.55]",
						style: { color: "var(--ink-2)" },
						children: t("landing.subtitleLong", "A quiet, hand-curated marketplace for Copenhagen. Properties, vehicles, services and experiences — one map, one conversation.")
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-8 md:mt-10",
						children: /* @__PURE__ */ jsx(HomeSearchBar, {})
					}),
					/* @__PURE__ */ jsx(m.div, {
						initial: { opacity: 0 },
						animate: { opacity: 1 },
						transition: {
							duration: .5,
							ease: EDITORIAL_EASE,
							delay: .45
						},
						className: "mt-6",
						children: /* @__PURE__ */ jsxs(Link, {
							to: "/explore",
							className: "group inline-flex items-center gap-2 text-sm transition-colors hover:text-foreground",
							style: { color: "var(--ink-3)" },
							children: [/* @__PURE__ */ jsx("span", {
								className: "meta-label",
								children: t("landing.openTheMap", "or browse everything on the map")
							}), /* @__PURE__ */ jsx(ArrowUpRight, {
								className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
								strokeWidth: 1.5
							})]
						})
					})
				]
			}), /* @__PURE__ */ jsx(m.div, {
				initial: {
					opacity: 0,
					scale: .985
				},
				animate: {
					opacity: 1,
					scale: 1
				},
				transition: {
					duration: .9,
					ease: EDITORIAL_EASE,
					delay: .15
				},
				className: "relative col-span-12 lg:col-span-5",
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/explore",
					className: "group relative block h-[320px] overflow-hidden border md:h-[440px] lg:h-[520px]",
					style: { borderColor: "var(--line-1)" },
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "pointer-events-none absolute inset-0",
							children: /* @__PURE__ */ jsx(MapView, {
								markers,
								hideToolbar: true,
								hideNavControls: true,
								interactive: false,
								center: [12.5683, 55.6761],
								zoom: 11
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pointer-events-none absolute inset-0",
							style: { background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.12) 100%)" }
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-xs",
							style: { color: "var(--surface-0)" },
							children: [/* @__PURE__ */ jsxs("div", {
								className: "inline-flex items-center gap-2 border bg-background/90 px-2.5 py-1.5 backdrop-blur-sm",
								style: {
									borderColor: "var(--line-1)",
									color: "var(--ink-1)"
								},
								children: [/* @__PURE__ */ jsx("span", {
									className: "inline-block h-1.5 w-1.5 rounded-full",
									style: { backgroundColor: "var(--amber)" },
									"aria-hidden": true
								}), /* @__PURE__ */ jsx("span", {
									className: "meta-label",
									children: t("landing.liveMap", "Live map · Copenhagen")
								})]
							}), /* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1 border bg-background/90 px-2.5 py-1.5 text-xs backdrop-blur-sm transition-colors group-hover:border-(--amber) group-hover:text-(--amber-ink)",
								style: {
									borderColor: "var(--line-1)",
									color: "var(--ink-2)"
								},
								children: [/* @__PURE__ */ jsx("span", {
									className: "meta-label",
									children: t("landing.openMap", "Open the map")
								}), /* @__PURE__ */ jsx(ArrowUpRight, {
									className: "h-3 w-3",
									strokeWidth: 1.5
								})]
							})]
						})
					]
				})
			})]
		})]
	});
}
//#endregion
//#region src/modules/landing/ui/NeighborhoodPills.tsx
function NeighborhoodPills() {
	const { t, i18n } = useTranslation();
	const { data, isLoading } = useQuery(homeStatsQueryOptions(i18n.language));
	const pills = data?.neighborhoods ?? [];
	if (!isLoading && pills.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		className: "mx-auto max-w-[1400px] px-6 py-10 md:px-10 md:py-14",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-5 flex items-baseline justify-between gap-4",
			children: [/* @__PURE__ */ jsx("span", {
				className: "meta-label",
				children: t("editorial.neighborhoods", "01 · Neighborhoods")
			}), /* @__PURE__ */ jsx("span", {
				className: "meta-label hidden md:inline",
				style: { color: "var(--ink-4)" },
				children: t("landing.whereToLook", "Where to look")
			})]
		}), /* @__PURE__ */ jsx(m.div, {
			initial: {
				opacity: 0,
				y: 8
			},
			whileInView: {
				opacity: 1,
				y: 0
			},
			viewport: {
				once: true,
				margin: "-80px"
			},
			transition: {
				duration: .5,
				ease: EDITORIAL_EASE
			},
			className: "flex flex-wrap items-center gap-2",
			children: (isLoading ? Array.from({ length: 6 }) : pills).map((p, i) => {
				if (isLoading || !p) return /* @__PURE__ */ jsx("span", {
					className: "h-9 w-28 animate-pulse border",
					style: {
						borderColor: "var(--line-1)",
						backgroundColor: "var(--surface-2)"
					}
				}, i);
				const item = p;
				return /* @__PURE__ */ jsxs(Link, {
					to: "/explore",
					className: "group inline-flex items-baseline gap-2 border px-3.5 py-2 transition-colors hover:border-(--amber) hover:bg-(--amber-soft)",
					style: { borderColor: "var(--line-1)" },
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-display text-sm",
						style: { color: "var(--ink-1)" },
						children: item.label
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[11px] tabular-nums",
						style: { color: "var(--ink-3)" },
						children: item.count.toLocaleString(i18n.language === "es" ? "es-ES" : "en-DK")
					})]
				}, item.label);
			})
		})]
	});
}
//#endregion
//#region src/modules/landing/ui/VerticalShowcase.tsx
var PLACEHOLDER$1 = "/img-placeholder.svg";
var handleImgError = (e) => {
	e.currentTarget.src = PLACEHOLDER$1;
	e.currentTarget.onerror = null;
};
var VERTICALS = [
	{
		id: "property",
		number: "01",
		icon: Home,
		titleKey: "landing.properties",
		titleFallback: "Properties",
		descKey: "landing.propertiesDesc",
		descFallback: "Houses, flats, land and more",
		accent: "var(--amber-ink)"
	},
	{
		id: "vehicle",
		number: "02",
		icon: Car,
		titleKey: "landing.vehicles",
		titleFallback: "Vehicles",
		descKey: "landing.vehiclesDesc",
		descFallback: "Cars, bikes, boats and more",
		accent: "#2d6a4f"
	},
	{
		id: "service",
		number: "03",
		icon: Wrench,
		titleKey: "landing.services",
		titleFallback: "Services",
		descKey: "landing.servicesDesc",
		descFallback: "Trades, tutors, craftspeople",
		accent: "#9e2a2b"
	},
	{
		id: "experience",
		number: "04",
		icon: Sparkles,
		titleKey: "landing.experiences",
		titleFallback: "Experiences",
		descKey: "landing.experiencesDesc",
		descFallback: "Tours, workshops, unique things",
		accent: "#5b3a91"
	}
];
function VerticalShowcase() {
	const { t, i18n } = useTranslation();
	const { data } = useQuery(homeStatsQueryOptions(i18n.language));
	return /* @__PURE__ */ jsxs("section", {
		className: "mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-10 flex items-baseline justify-between gap-4",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "meta-label",
				children: ["02 · ", t("landing.verticalsLabel", "Verticals")]
			}), /* @__PURE__ */ jsx("span", {
				className: "meta-label hidden md:inline",
				style: { color: "var(--ink-4)" },
				children: t("editorial.fourCategories", "Four categories")
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-1 gap-px bg-(--line-1) md:grid-cols-2",
			children: VERTICALS.map((v, i) => {
				const count = data?.categoryCounts[v.id] ?? 0;
				const samples = data?.samples[v.id] ?? [];
				const Icon = v.icon;
				const hero = samples[0];
				const thumbs = samples.slice(1, 3);
				return /* @__PURE__ */ jsx(m.div, {
					initial: {
						opacity: 0,
						y: 16
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: {
						once: true,
						margin: "-80px"
					},
					transition: {
						duration: .5,
						ease: EDITORIAL_EASE,
						delay: i * .06
					},
					className: "bg-background",
					children: /* @__PURE__ */ jsxs(Link, {
						to: "/explore",
						className: "group block p-6 transition-colors hover:bg-(--surface-2) md:p-8",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "mb-6 flex items-start justify-between gap-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex items-baseline gap-3",
									children: /* @__PURE__ */ jsxs("span", {
										className: "meta-label tabular-nums",
										style: { color: v.accent },
										children: [
											v.number,
											" / ",
											v.id
										]
									})
								}), /* @__PURE__ */ jsx(Icon, {
									className: "h-5 w-5 transition-colors",
									strokeWidth: 1.5,
									style: { color: "var(--ink-3)" }
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mb-6 grid h-48 grid-cols-[2fr_1fr] gap-1.5 md:h-56",
								children: [/* @__PURE__ */ jsx("div", {
									className: "relative h-full overflow-hidden bg-(--surface-2)",
									children: hero?.coverUrl ? /* @__PURE__ */ jsx("img", {
										src: hero.coverUrl,
										alt: hero.title,
										onError: handleImgError,
										className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
									}) : /* @__PURE__ */ jsx("div", {
										className: "flex h-full items-center justify-center",
										children: /* @__PURE__ */ jsx(Icon, {
											className: "h-10 w-10",
											strokeWidth: 1,
											style: { color: "var(--ink-4)" }
										})
									})
								}), /* @__PURE__ */ jsx("div", {
									className: "grid grid-rows-2 gap-1.5",
									children: [0, 1].map((idx) => {
										const thumb = thumbs[idx];
										return /* @__PURE__ */ jsx("div", {
											className: "relative h-full overflow-hidden bg-(--surface-2)",
											children: thumb?.coverUrl ? /* @__PURE__ */ jsx("img", {
												src: thumb.coverUrl,
												alt: thumb.title,
												onError: handleImgError,
												className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
											}) : null
										}, idx);
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-end justify-between gap-6",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "font-display text-3xl font-medium leading-none tracking-[-0.015em] text-foreground md:text-4xl",
									children: t(v.titleKey, v.titleFallback)
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-2 text-sm",
									style: { color: "var(--ink-2)" },
									children: t(v.descKey, v.descFallback)
								})] }), /* @__PURE__ */ jsxs("div", {
									className: "flex shrink-0 items-center gap-3",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "text-right",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-display text-2xl font-medium tabular-nums leading-none text-foreground",
											children: count.toLocaleString(i18n.language === "es" ? "es-ES" : "en-DK")
										}), /* @__PURE__ */ jsx("p", {
											className: "meta-label mt-1",
											style: { color: "var(--ink-3)" },
											children: t("landing.listings", "listings")
										})]
									}), /* @__PURE__ */ jsx(ArrowUpRight, {
										className: "h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
										strokeWidth: 1.5,
										style: { color: "var(--ink-2)" }
									})]
								})]
							})
						]
					})
				}, v.id);
			})
		})]
	});
}
//#endregion
//#region src/modules/landing/ui/HomeManifesto.tsx
function HomeManifesto() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsx("section", {
		className: "mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-32",
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-12 gap-6",
			children: [/* @__PURE__ */ jsx(m.div, {
				initial: { opacity: 0 },
				whileInView: { opacity: 1 },
				viewport: {
					once: true,
					margin: "-120px"
				},
				transition: {
					duration: .8,
					ease: EDITORIAL_EASE
				},
				className: "col-span-12 md:col-span-1 md:col-start-2",
				children: /* @__PURE__ */ jsx("span", {
					className: "meta-label block",
					style: { color: "var(--amber-ink)" },
					children: t("landing.manifesto.label", "Manifesto")
				})
			}), /* @__PURE__ */ jsxs(m.blockquote, {
				initial: {
					opacity: 0,
					y: 16
				},
				whileInView: {
					opacity: 1,
					y: 0
				},
				viewport: {
					once: true,
					margin: "-120px"
				},
				transition: {
					duration: .8,
					ease: EDITORIAL_EASE,
					delay: .08
				},
				className: "col-span-12 md:col-span-8",
				children: [/* @__PURE__ */ jsx("p", {
					className: "font-display text-[clamp(1.75rem,1.1rem+2vw,2.75rem)] font-normal italic leading-[1.2] tracking-[-0.01em] text-foreground",
					children: t("landing.manifesto.body", "We believe a marketplace should feel like a neighbourhood. Slower than a feed, warmer than a database. Every listing here was either written by someone who lives here, or carefully curated from the open web — then stitched onto a single map so you can see, at a glance, where Copenhagen is moving.")
				}), /* @__PURE__ */ jsxs("footer", {
					className: "mt-6 flex items-baseline gap-3",
					children: [/* @__PURE__ */ jsx("span", {
						className: "h-px w-10 bg-(--ink-3)",
						"aria-hidden": true
					}), /* @__PURE__ */ jsx("span", {
						className: "meta-label",
						style: { color: "var(--ink-2)" },
						children: t("landing.manifesto.signature", "The editors · GeoLocal CPH")
					})]
				})]
			})]
		})
	});
}
//#endregion
//#region src/modules/landing/ui/HomeMapMoment.tsx
function HomeMapMoment() {
	const { t, i18n } = useTranslation();
	const { data } = useQuery(homeStatsQueryOptions(i18n.language));
	const markers = data?.heroMarkers?.filter((m) => m.latitude != null && m.longitude != null).map((m) => ({
		id: m.id,
		slug: m.slug,
		category: m.category,
		price: m.price,
		currency: m.currency,
		latitude: m.latitude,
		longitude: m.longitude
	})) ?? [];
	return /* @__PURE__ */ jsx("section", {
		className: "mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24",
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-12 gap-6 gap-y-10",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "col-span-12 md:col-span-4",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "meta-label",
						children: t("editorial.mapped", "04 · The map")
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-3 font-display text-[clamp(2.25rem,1.4rem+3vw,4rem)] font-medium leading-[0.95] tracking-[-0.02em] text-foreground",
						children: t("landing.mapTitle", "Copenhagen, mapped")
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-5 max-w-prose text-base leading-relaxed",
						style: { color: "var(--ink-2)" },
						children: t("landing.mapDesc", "Every listing pinned to a single map so you can scan a neighbourhood in seconds and spot the ones that are walking distance from your life.")
					}),
					/* @__PURE__ */ jsxs("dl", {
						className: "mt-8 space-y-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between gap-4 border-b pb-2",
							style: { borderColor: "var(--line-1)" },
							children: [/* @__PURE__ */ jsx("dt", {
								className: "meta-label",
								style: { color: "var(--ink-3)" },
								children: t("landing.stats.totalOnMap", "Pinned on the map")
							}), /* @__PURE__ */ jsx("dd", {
								className: "font-display text-2xl font-medium tabular-nums",
								style: { color: "var(--ink-1)" },
								children: (data?.total ?? 0).toLocaleString(i18n.language === "es" ? "es-ES" : "en-DK")
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between gap-4 border-b pb-2",
							style: { borderColor: "var(--line-1)" },
							children: [/* @__PURE__ */ jsx("dt", {
								className: "meta-label",
								style: { color: "var(--ink-3)" },
								children: t("landing.stats.neighborhoods", "Neighbourhoods")
							}), /* @__PURE__ */ jsx("dd", {
								className: "font-display text-2xl font-medium tabular-nums",
								style: { color: "var(--ink-1)" },
								children: (data?.neighborhoods?.length ?? 0).toLocaleString(i18n.language === "es" ? "es-ES" : "en-DK")
							})]
						})]
					}),
					/* @__PURE__ */ jsxs(Link, {
						to: "/explore",
						className: "group mt-8 inline-flex items-center gap-3 border-b border-foreground pb-1 text-sm font-medium text-foreground transition-colors hover:border-(--amber) hover:text-(--amber-ink)",
						children: [t("landing.openMap", "Open the full map"), /* @__PURE__ */ jsx(ArrowUpRight, {
							className: "h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
							strokeWidth: 1.5
						})]
					})
				]
			}), /* @__PURE__ */ jsx(m.div, {
				initial: {
					opacity: 0,
					y: 16
				},
				whileInView: {
					opacity: 1,
					y: 0
				},
				viewport: {
					once: true,
					margin: "-120px"
				},
				transition: {
					duration: .7,
					ease: EDITORIAL_EASE
				},
				className: "col-span-12 md:col-span-8",
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/explore",
					className: "group relative block h-[420px] overflow-hidden border md:h-[560px]",
					style: { borderColor: "var(--line-1)" },
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "pointer-events-none absolute inset-0",
							children: /* @__PURE__ */ jsx(MapView, {
								markers,
								hideToolbar: true,
								hideNavControls: true,
								interactive: false,
								center: [12.5683, 55.6761],
								zoom: 11
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pointer-events-none absolute inset-0",
							style: { background: "linear-gradient(180deg, transparent 70%, rgba(0,0,0,0.15) 100%)" }
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "absolute bottom-4 right-4 inline-flex items-center gap-2 border bg-background/90 px-3 py-2 backdrop-blur-sm transition-colors group-hover:border-(--amber) group-hover:text-(--amber-ink)",
							style: {
								borderColor: "var(--line-1)",
								color: "var(--ink-1)"
							},
							children: [/* @__PURE__ */ jsx(Expand, {
								className: "h-3.5 w-3.5",
								strokeWidth: 1.5
							}), /* @__PURE__ */ jsx("span", {
								className: "meta-label",
								children: t("landing.exploreMap", "Explore on the map")
							})]
						})
					]
				})
			})]
		})
	});
}
//#endregion
//#region src/modules/landing/ui/HomeClosingCTA.tsx
function HomeClosingCTA() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsx("section", {
		className: "mx-auto max-w-[1400px] px-6 pb-20 pt-10 md:px-10 md:pb-32 md:pt-20",
		children: /* @__PURE__ */ jsx(m.div, {
			initial: {
				opacity: 0,
				y: 20
			},
			whileInView: {
				opacity: 1,
				y: 0
			},
			viewport: {
				once: true,
				margin: "-120px"
			},
			transition: {
				duration: .7,
				ease: EDITORIAL_EASE
			},
			className: "border px-6 py-14 md:px-14 md:py-20",
			style: {
				borderColor: "var(--line-1)",
				backgroundColor: "var(--surface-2)"
			},
			children: /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-12 items-end gap-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "col-span-12 md:col-span-8",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "meta-label",
							style: { color: "var(--amber-ink)" },
							children: t("editorial.closing", "06 · Your turn")
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-4 font-display text-[clamp(2.5rem,1.4rem+4vw,5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-foreground",
							children: t("landing.closing.title", "Own the block. Rent it. Sell it. Live it.")
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-5 max-w-[52ch] text-base leading-relaxed md:text-lg",
							style: { color: "var(--ink-2)" },
							children: t("landing.closing.desc", "GeoLocal is free to browse. Listings are published by locals and lightly curated from the open web — no ads, no dark patterns, just a map and the city.")
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "col-span-12 flex items-center gap-3 md:col-span-4 md:justify-end",
					children: /* @__PURE__ */ jsxs(Link, {
						to: "/explore",
						className: "group inline-flex items-center gap-3 bg-foreground px-6 py-4 text-sm font-medium text-background transition-colors hover:bg-(--amber) hover:text-(--surface-0)",
						children: [/* @__PURE__ */ jsx("span", { children: t("landing.closing.cta", "Start exploring") }), /* @__PURE__ */ jsx(ArrowUpRight, {
							className: "h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
							strokeWidth: 1.5
						})]
					})
				})]
			})
		})
	});
}
//#endregion
//#region src/components/ui/carousel.tsx
var CarouselContext = React$1.createContext(null);
function useCarousel() {
	const context = React$1.useContext(CarouselContext);
	if (!context) throw new Error("useCarousel must be used within a <Carousel />");
	return context;
}
function Carousel({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }) {
	const [carouselRef, api] = useEmblaCarousel({
		...opts,
		axis: orientation === "horizontal" ? "x" : "y"
	}, plugins);
	const [canScrollPrev, setCanScrollPrev] = React$1.useState(false);
	const [canScrollNext, setCanScrollNext] = React$1.useState(false);
	const onSelect = React$1.useCallback((api) => {
		if (!api) return;
		setCanScrollPrev(api.canScrollPrev());
		setCanScrollNext(api.canScrollNext());
	}, []);
	const scrollPrev = React$1.useCallback(() => {
		api?.scrollPrev();
	}, [api]);
	const scrollNext = React$1.useCallback(() => {
		api?.scrollNext();
	}, [api]);
	const handleKeyDown = React$1.useCallback((event) => {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			scrollPrev();
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			scrollNext();
		}
	}, [scrollPrev, scrollNext]);
	React$1.useEffect(() => {
		if (!api || !setApi) return;
		setApi(api);
	}, [api, setApi]);
	React$1.useEffect(() => {
		if (!api) return;
		onSelect(api);
		api.on("reInit", onSelect);
		api.on("select", onSelect);
		return () => {
			api?.off("select", onSelect);
		};
	}, [api, onSelect]);
	return /* @__PURE__ */ jsx(CarouselContext.Provider, {
		value: {
			carouselRef,
			api,
			opts,
			orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
			scrollPrev,
			scrollNext,
			canScrollPrev,
			canScrollNext
		},
		children: /* @__PURE__ */ jsx("div", {
			onKeyDownCapture: handleKeyDown,
			className: cn("relative", className),
			role: "region",
			"aria-roledescription": "carousel",
			"data-slot": "carousel",
			...props,
			children
		})
	});
}
function CarouselContent({ className, ...props }) {
	const { carouselRef, orientation } = useCarousel();
	return /* @__PURE__ */ jsx("div", {
		ref: carouselRef,
		className: "overflow-hidden",
		"data-slot": "carousel-content",
		children: /* @__PURE__ */ jsx("div", {
			className: cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className),
			...props
		})
	});
}
function CarouselItem({ className, ...props }) {
	const { orientation } = useCarousel();
	return /* @__PURE__ */ jsx("div", {
		role: "group",
		"aria-roledescription": "slide",
		"data-slot": "carousel-item",
		className: cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className),
		...props
	});
}
function CarouselPrevious({ className, variant = "outline", size = "icon", ...props }) {
	const { orientation, scrollPrev, canScrollPrev } = useCarousel();
	return /* @__PURE__ */ jsxs(Button, {
		"data-slot": "carousel-previous",
		variant,
		size,
		className: cn("absolute size-8 rounded-full", orientation === "horizontal" ? "top-1/2 -left-12 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className),
		disabled: !canScrollPrev,
		onClick: scrollPrev,
		...props,
		children: [/* @__PURE__ */ jsx(ArrowLeft, {}), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: "Previous slide"
		})]
	});
}
function CarouselNext({ className, variant = "outline", size = "icon", ...props }) {
	const { orientation, scrollNext, canScrollNext } = useCarousel();
	return /* @__PURE__ */ jsxs(Button, {
		"data-slot": "carousel-next",
		variant,
		size,
		className: cn("absolute size-8 rounded-full", orientation === "horizontal" ? "top-1/2 -right-12 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className),
		disabled: !canScrollNext,
		onClick: scrollNext,
		...props,
		children: [/* @__PURE__ */ jsx(ArrowRight, {}), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: "Next slide"
		})]
	});
}
//#endregion
//#region src/modules/landing/ui/FeaturedCarousel.tsx
function FeaturedCarousel() {
	const { i18n } = useTranslation();
	const { data: featured, isLoading } = useQuery(featuredListingsQueryOptions(12, i18n.language));
	const { isFavorite, toggle: toggleFavorite } = useFavorites();
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "flex gap-6 overflow-hidden",
		children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxs("div", {
			className: "w-80 shrink-0 space-y-3",
			children: [
				/* @__PURE__ */ jsx(Skeleton, { className: "aspect-[4/5] w-full" }),
				/* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-2/3" }),
				/* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/3" })
			]
		}, i))
	});
	if (!featured?.length) return null;
	return /* @__PURE__ */ jsxs(Carousel, {
		opts: {
			align: "start",
			loop: false
		},
		className: "w-full",
		children: [
			/* @__PURE__ */ jsx(CarouselContent, {
				className: "-ml-6",
				children: featured.map((item, i) => {
					const Icon = CATEGORY_ICONS[item.category] ?? Home;
					const accent = CATEGORY_ACCENT_VAR[item.category] ?? "var(--amber-ink)";
					const { amount: priceLabel, suffix: periodSuffix } = formatListingPrice(item.price, item.currency, item.pricePeriod, i18n.language);
					return /* @__PURE__ */ jsx(CarouselItem, {
						className: "pl-6 basis-[78%] sm:basis-[45%] lg:basis-[32%] xl:basis-[25%]",
						children: /* @__PURE__ */ jsx(m.div, {
							initial: {
								opacity: 0,
								y: 16
							},
							whileInView: {
								opacity: 1,
								y: 0
							},
							viewport: {
								once: true,
								margin: "-40px"
							},
							transition: {
								delay: i * .04,
								duration: .5,
								ease: EDITORIAL_EASE
							},
							children: /* @__PURE__ */ jsxs(Link, {
								to: "/listing/$slug",
								params: { slug: item.slug },
								className: "group block",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "relative mb-5 aspect-[4/5] overflow-hidden bg-[var(--surface-2)]",
										children: [
											item.coverUrl ? /* @__PURE__ */ jsx("img", {
												src: item.coverUrl,
												alt: item.title,
												className: "h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]",
												loading: "lazy"
											}) : /* @__PURE__ */ jsx("div", {
												className: "flex h-full w-full items-center justify-center",
												children: /* @__PURE__ */ jsx(Icon, {
													className: "h-10 w-10",
													style: { color: "var(--ink-4)" },
													strokeWidth: 1
												})
											}),
											/* @__PURE__ */ jsx("div", {
												className: "pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-[var(--surface-0)]",
												children: /* @__PURE__ */ jsx("span", {
													className: "meta-label",
													style: { color: "oklch(1 0 0 / 0.9)" },
													children: item.category
												})
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: (e) => {
													e.preventDefault();
													e.stopPropagation();
													toggleFavorite(item.id);
												},
												"aria-label": isFavorite(item.id) ? "Remove from favorites" : "Save to favorites",
												className: "absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-background/80 backdrop-blur-sm transition-colors hover:bg-background",
												children: /* @__PURE__ */ jsx(Heart, {
													className: "h-4 w-4",
													strokeWidth: 1.5,
													style: {
														fill: isFavorite(item.id) ? "var(--red)" : "transparent",
														stroke: isFavorite(item.id) ? "var(--red)" : "var(--ink-2)"
													}
												})
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mb-1 flex items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "meta-label",
											style: { color: accent },
											children: item.city
										}), /* @__PURE__ */ jsx("span", {
											className: "meta-label",
											style: { color: "var(--ink-4)" },
											children: item.subCategory
										})]
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-display text-lg font-medium leading-[1.15] tracking-[-0.015em] text-foreground transition-colors duration-300 group-hover:text-[var(--amber-ink)] md:text-xl",
										children: item.title
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-2 font-sans text-sm tabular-nums",
										style: { color: "var(--ink-2)" },
										children: [priceLabel, periodSuffix && /* @__PURE__ */ jsx("span", {
											style: { color: "var(--ink-3)" },
											children: periodSuffix
										})]
									})
								]
							})
						})
					}, item.id);
				})
			}),
			/* @__PURE__ */ jsx(CarouselPrevious, { className: "hidden sm:flex -left-2 h-10 w-10 rounded-none border-border bg-background shadow-none" }),
			/* @__PURE__ */ jsx(CarouselNext, { className: "hidden sm:flex -right-2 h-10 w-10 rounded-none border-border bg-background shadow-none" })
		]
	});
}
//#endregion
//#region src/modules/landing/ui/ScrapedCarousel.tsx
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
function ScrapedCarousel() {
	const { i18n } = useTranslation();
	const { data: items, isLoading } = useQuery(scrapedListingsQueryOptions(16, i18n.language));
	const { isFavorite, toggle: toggleFavorite } = useFavorites();
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "flex gap-6 overflow-hidden",
		children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxs("div", {
			className: "w-72 shrink-0 space-y-3",
			children: [
				/* @__PURE__ */ jsx(Skeleton, { className: "aspect-3/2 w-full" }),
				/* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-2/3" }),
				/* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/3" })
			]
		}, i))
	});
	if (!items?.length) return null;
	return /* @__PURE__ */ jsxs(Carousel, {
		opts: {
			align: "start",
			loop: false
		},
		className: "w-full",
		children: [
			/* @__PURE__ */ jsx(CarouselContent, {
				className: "-ml-5",
				children: items.map((item, i) => {
					const Icon = CATEGORY_ICONS[item.category] ?? Home;
					const source = item.scrapedSource ?? "";
					const sourceLabel = SOURCE_LABELS[source] ?? source;
					const sourceColor = SOURCE_COLORS[source] ?? "var(--ink-3)";
					const { amount: priceLabel, suffix: periodSuffix } = formatListingPrice(item.price, item.currency, item.pricePeriod, i18n.language);
					return /* @__PURE__ */ jsx(CarouselItem, {
						className: "pl-5 basis-[85%] sm:basis-[50%] lg:basis-[33%] xl:basis-[25%]",
						children: /* @__PURE__ */ jsx(m.div, {
							initial: {
								opacity: 0,
								y: 16
							},
							whileInView: {
								opacity: 1,
								y: 0
							},
							viewport: {
								once: true,
								margin: "-40px"
							},
							transition: {
								delay: i * .04,
								duration: .5,
								ease: EDITORIAL_EASE
							},
							children: /* @__PURE__ */ jsxs(Link, {
								to: "/listing/$slug",
								params: { slug: item.slug },
								className: "group block",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "relative mb-4 aspect-3/2 overflow-hidden bg-(--surface-2)",
										children: [
											item.coverUrl ? /* @__PURE__ */ jsx("img", {
												src: item.coverUrl,
												alt: item.title,
												className: "h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.04]",
												loading: "lazy",
												onError: (e) => {
													e.currentTarget.src = PLACEHOLDER;
													e.currentTarget.onerror = null;
												}
											}) : /* @__PURE__ */ jsx("div", {
												className: "flex h-full w-full items-center justify-center",
												children: /* @__PURE__ */ jsx(Icon, {
													className: "h-8 w-8",
													style: { color: "var(--ink-4)" },
													strokeWidth: 1
												})
											}),
											source && /* @__PURE__ */ jsxs("a", {
												href: item.scrapedSourceUrl ?? "#",
												target: "_blank",
												rel: "noopener noreferrer",
												onClick: (e) => e.stopPropagation(),
												className: "absolute right-3 top-3 inline-flex items-center gap-1 rounded-none border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm transition-opacity hover:opacity-80",
												style: { color: sourceColor },
												children: [sourceLabel, /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" })]
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: (e) => {
													e.preventDefault();
													e.stopPropagation();
													toggleFavorite(item.id);
												},
												"aria-label": isFavorite(item.id) ? "Remove from favorites" : "Save to favorites",
												className: "absolute left-3 top-3 flex h-8 w-8 items-center justify-center bg-background/80 backdrop-blur-sm transition-colors hover:bg-background",
												children: /* @__PURE__ */ jsx(Heart, {
													className: "h-3.5 w-3.5",
													strokeWidth: 1.5,
													style: {
														fill: isFavorite(item.id) ? "var(--red)" : "transparent",
														stroke: isFavorite(item.id) ? "var(--red)" : "var(--ink-2)"
													}
												})
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mb-1 flex items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "meta-label",
											style: { color: "var(--ink-3)" },
											children: item.city
										}), /* @__PURE__ */ jsx("span", {
											className: "meta-label",
											style: { color: "var(--ink-4)" },
											children: item.category
										})]
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-display line-clamp-2 text-base font-medium leading-[1.2] tracking-[-0.01em] text-foreground transition-colors group-hover:text-(--amber-ink) md:text-lg",
										children: item.title
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-1.5 font-sans text-sm tabular-nums",
										style: { color: "var(--ink-2)" },
										children: [priceLabel, periodSuffix && /* @__PURE__ */ jsx("span", {
											style: { color: "var(--ink-3)" },
											children: periodSuffix
										})]
									})
								]
							})
						})
					}, item.id);
				})
			}),
			/* @__PURE__ */ jsx(CarouselPrevious, { className: "hidden sm:flex -left-2 h-10 w-10 rounded-none border-border bg-background shadow-none" }),
			/* @__PURE__ */ jsx(CarouselNext, { className: "hidden sm:flex -right-2 h-10 w-10 rounded-none border-border bg-background shadow-none" })
		]
	});
}
//#endregion
//#region src/modules/landing/ui/LandingPage.tsx
function LandingPage() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-background",
		children: [
			/* @__PURE__ */ jsx(HomeHero, {}),
			/* @__PURE__ */ jsx(EditorialRule, {}),
			/* @__PURE__ */ jsx(NeighborhoodPills, {}),
			/* @__PURE__ */ jsx(EditorialRule, {}),
			/* @__PURE__ */ jsx(VerticalShowcase, {}),
			/* @__PURE__ */ jsx(HomeManifesto, {}),
			/* @__PURE__ */ jsx(EditorialRule, {}),
			/* @__PURE__ */ jsxs("section", {
				className: "mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-10 flex items-end justify-between gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "meta-label",
							children: ["03 · ", t("landing.fromTheWebLabel", "From the web")]
						}), /* @__PURE__ */ jsx("h2", {
							className: "font-display text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] font-medium leading-none tracking-[-0.02em] text-foreground",
							children: t("landing.curated", "Curated")
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "hidden flex-col items-end gap-1 text-right md:flex",
						children: [/* @__PURE__ */ jsx("p", {
							className: "max-w-[28ch] text-sm leading-relaxed",
							style: { color: "var(--ink-3)" },
							children: t("landing.curatedDesc", "A hand-picked cut from Airbnb, Boliga, Homestra, Facebook and more.")
						}), /* @__PURE__ */ jsxs(Link, {
							to: "/explore",
							className: "group mt-1 inline-flex items-center gap-2 border-b border-border pb-0.5 text-sm transition-colors hover:border-(--amber) hover:text-foreground",
							style: { color: "var(--ink-2)" },
							children: [t("landing.exploreAll", "See all"), /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" })]
						})]
					})]
				}), /* @__PURE__ */ jsx(ScrapedCarousel, {})]
			}),
			/* @__PURE__ */ jsx(EditorialRule, {}),
			/* @__PURE__ */ jsx(HomeMapMoment, {}),
			/* @__PURE__ */ jsx(EditorialRule, {}),
			/* @__PURE__ */ jsxs("section", {
				className: "mx-auto max-w-[1400px] px-6 pb-16 pt-16 md:px-10 md:pb-20 md:pt-24",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-10 flex items-end justify-between gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "meta-label",
							children: ["05 · ", t("landing.thisWeekLabel", "This week")]
						}), /* @__PURE__ */ jsx("h2", {
							className: "font-display text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] font-medium leading-none tracking-[-0.02em] text-foreground",
							children: t("landing.featured", "Featured")
						})]
					}), /* @__PURE__ */ jsxs(Link, {
						to: "/explore",
						className: "group hidden items-center gap-2 border-b border-border pb-0.5 text-sm transition-colors hover:border-(--amber) hover:text-foreground md:inline-flex",
						style: { color: "var(--ink-2)" },
						children: [t("landing.exploreAll", "See all"), /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" })]
					})]
				}), /* @__PURE__ */ jsx(FeaturedCarousel, {})]
			}),
			/* @__PURE__ */ jsx(HomeClosingCTA, {}),
			/* @__PURE__ */ jsx(Footer, {})
		]
	});
}
function EditorialRule() {
	return /* @__PURE__ */ jsx("div", {
		className: "mx-auto max-w-[1400px] px-6 md:px-10",
		children: /* @__PURE__ */ jsx("div", { className: "h-px bg-border" })
	});
}
//#endregion
//#region src/routes/_public/index.tsx?tsr-split=component
var SplitComponent = LandingPage;
//#endregion
export { SplitComponent as component };
