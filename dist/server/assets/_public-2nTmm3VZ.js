import { t as cn } from "./utils-C98NY0TH.js";
import { t as Button } from "./button-DX0eJ04i.js";
import { t as Skeleton } from "./skeleton-ePPLs61V.js";
import { i as formatListingPrice, n as CATEGORY_ICONS, r as EDITORIAL_EASE, t as CATEGORY_ACCENT_VAR } from "./display-wPMPnOaq.js";
import { t as Footer } from "./footer-Do_tZ2fr.js";
import { a as scrapedListingsQueryOptions, t as featuredListingsQueryOptions } from "./queries-C9jbt2hB.js";
import * as React$1 from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ArrowUpRight, Car, ExternalLink, Home, Sparkles, Wrench } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
//#region src/modules/landing/ui/CategoryCard.tsx
function CategoryCard({ icon: Icon, category, number, title, description, index }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsx(m.div, {
		initial: {
			opacity: 0,
			y: 20
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .5,
			ease: EDITORIAL_EASE,
			delay: index * .08
		},
		className: "group relative bg-background transition-colors duration-300 hover:bg-[var(--surface-2)]",
		children: /* @__PURE__ */ jsxs(Link, {
			to: "/explore",
			search: { category },
			className: "flex h-full flex-col justify-between gap-10 p-8 md:p-10",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-start justify-between",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "meta-label",
						style: { color: CATEGORY_ACCENT_VAR[category] },
						children: [
							number,
							" / ",
							category
						]
					}), /* @__PURE__ */ jsx(Icon, {
						className: "h-5 w-5 transition-transform duration-500",
						style: { color: "var(--ink-3)" },
						strokeWidth: 1.25
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ jsx("h3", {
						className: "font-display text-[clamp(1.875rem,1.4rem+2vw,2.75rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground",
						children: title
					}), /* @__PURE__ */ jsx("p", {
						className: "max-w-[32ch] text-sm leading-relaxed",
						style: { color: "var(--ink-2)" },
						children: description
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 text-sm transition-colors",
					style: { color: "var(--ink-2)" },
					children: [/* @__PURE__ */ jsx("span", {
						className: "border-b border-transparent pb-0.5 transition-colors group-hover:border-[var(--amber)] group-hover:text-foreground",
						children: t("editorial.discover", "Discover")
					}), /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--amber-ink)]" })]
				})
			]
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
										children: [item.coverUrl ? /* @__PURE__ */ jsx("img", {
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
										}), /* @__PURE__ */ jsx("div", {
											className: "pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-[var(--surface-0)]",
											children: /* @__PURE__ */ jsx("span", {
												className: "meta-label",
												style: { color: "oklch(1 0 0 / 0.9)" },
												children: item.category
											})
										})]
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
										children: [item.coverUrl ? /* @__PURE__ */ jsx("img", {
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
										}), source && /* @__PURE__ */ jsxs("a", {
											href: item.scrapedSourceUrl ?? "#",
											target: "_blank",
											rel: "noopener noreferrer",
											onClick: (e) => e.stopPropagation(),
											className: "absolute right-3 top-3 inline-flex items-center gap-1 rounded-none border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm transition-opacity hover:opacity-80",
											style: { color: sourceColor },
											children: [sourceLabel, /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" })]
										})]
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
			/* @__PURE__ */ jsxs("section", {
				className: "mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 pb-20 pt-20 md:px-10 md:pb-28 md:pt-28 lg:pt-32",
				children: [
					/* @__PURE__ */ jsxs(m.div, {
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
						className: "col-span-12 flex items-baseline gap-6 md:col-span-10",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "meta-label",
								children: t("editorial.established", "Copenhagen · Est. 2026")
							}),
							/* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" }),
							/* @__PURE__ */ jsx("span", {
								className: "meta-label hidden md:inline",
								children: t("editorial.volume", "Vol. 01")
							})
						]
					}),
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
						className: "font-display col-span-12 text-[clamp(3.5rem,2rem+7vw,7.5rem)] font-medium leading-[0.95] tracking-[-0.025em] text-foreground md:col-span-10",
						children: t("landing.hero", "¿Qué estás buscando?")
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "col-span-12 grid grid-cols-1 gap-8 md:col-span-10 md:grid-cols-3 md:gap-10",
						children: [/* @__PURE__ */ jsx(m.p, {
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
							className: "col-span-1 max-w-prose text-base leading-relaxed text-ink-2 md:col-span-2 md:text-lg md:leading-[1.55]",
							style: { color: "var(--ink-2)" },
							children: t("landing.subtitle", "Inmuebles, vehículos, servicios y experiencias cerca de ti en Copenhague")
						}), /* @__PURE__ */ jsx(m.div, {
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
								delay: .28
							},
							className: "col-span-1 flex items-start md:justify-end",
							children: /* @__PURE__ */ jsxs(Link, {
								to: "/explore",
								className: "group inline-flex items-center gap-3 border-b border-foreground pb-1 text-sm font-medium text-foreground transition-colors hover:border-[var(--amber)] hover:text-[var(--amber-ink)]",
								children: [t("landing.exploreAll", "Explore all"), /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" })]
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto max-w-[1400px] px-6 md:px-10",
				children: /* @__PURE__ */ jsx("div", { className: "h-px bg-border" })
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-10 flex items-baseline justify-between gap-4",
					children: [/* @__PURE__ */ jsx("span", {
						className: "meta-label",
						children: t("editorial.verticals", "01 · Verticals")
					}), /* @__PURE__ */ jsx("span", {
						className: "meta-label hidden text-right md:inline",
						style: { color: "var(--ink-4)" },
						children: t("editorial.fourCategories", "Four categories")
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ jsx(CategoryCard, {
							icon: Home,
							category: "property",
							number: "01",
							title: t("landing.properties", "Properties"),
							description: t("landing.propertiesDesc", "Casas, apartamentos, terrenos y más"),
							index: 0
						}),
						/* @__PURE__ */ jsx(CategoryCard, {
							icon: Car,
							category: "vehicle",
							number: "02",
							title: t("landing.vehicles", "Vehicles"),
							description: t("landing.vehiclesDesc", "Autos, motos, bicicletas y más"),
							index: 1
						}),
						/* @__PURE__ */ jsx(CategoryCard, {
							icon: Wrench,
							category: "service",
							number: "03",
							title: t("landing.services", "Services"),
							description: t("landing.servicesDesc", "Profesionales y servicios a domicilio"),
							index: 2
						}),
						/* @__PURE__ */ jsx(CategoryCard, {
							icon: Sparkles,
							category: "experience",
							number: "04",
							title: t("landing.experiences", "Experiences"),
							description: t("landing.experiencesDesc", "Tours, talleres y actividades únicas"),
							index: 3
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto max-w-[1400px] px-6 md:px-10",
				children: /* @__PURE__ */ jsx("div", { className: "h-px bg-border" })
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-10 flex items-end justify-between gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "meta-label",
							children: t("editorial.fromTheWeb", "02 · From the web")
						}), /* @__PURE__ */ jsx("h2", {
							className: "font-display text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] font-medium leading-none tracking-[-0.02em] text-foreground",
							children: t("landing.curated", "Curated")
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "hidden flex-col items-end gap-1 text-right md:flex",
						children: [/* @__PURE__ */ jsx("p", {
							className: "max-w-[28ch] text-sm leading-relaxed",
							style: { color: "var(--ink-3)" },
							children: t("landing.curatedDesc", "Selección de Airbnb, Facebook y LinkedIn")
						}), /* @__PURE__ */ jsxs(Link, {
							to: "/explore",
							className: "group inline-flex items-center gap-2 border-b border-border pb-0.5 text-sm transition-colors hover:border-[var(--amber)] hover:text-foreground",
							style: { color: "var(--ink-2)" },
							children: [t("landing.exploreAll", "See all"), /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" })]
						})]
					})]
				}), /* @__PURE__ */ jsx(ScrapedCarousel, {})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto max-w-[1400px] px-6 md:px-10",
				children: /* @__PURE__ */ jsx("div", { className: "h-px bg-border" })
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mx-auto max-w-[1400px] px-6 pb-24 md:px-10 md:pb-32",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-10 flex items-end justify-between gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "meta-label",
							children: t("editorial.thisWeek", "03 · This week")
						}), /* @__PURE__ */ jsx("h2", {
							className: "font-display text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] font-medium leading-none tracking-[-0.02em] text-foreground",
							children: t("landing.featured", "Featured")
						})]
					}), /* @__PURE__ */ jsxs(Link, {
						to: "/explore",
						className: "group hidden items-center gap-2 border-b border-border pb-0.5 text-sm text-ink-2 transition-colors hover:border-[var(--amber)] hover:text-foreground md:inline-flex",
						style: { color: "var(--ink-2)" },
						children: [t("landing.exploreAll", "See all"), /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" })]
					})]
				}), /* @__PURE__ */ jsx(FeaturedCarousel, {})]
			}),
			/* @__PURE__ */ jsx(Footer, {})
		]
	});
}
//#endregion
//#region src/routes/_public/index.tsx?tsr-split=component
var SplitComponent = LandingPage;
//#endregion
export { SplitComponent as component };
