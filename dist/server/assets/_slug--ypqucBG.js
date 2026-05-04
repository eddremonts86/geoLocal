import { t as cn } from "./utils-C17k1q7P.js";
import { t as Route } from "./_slug-DDV_J8_2.js";
import { a as startThreadFn } from "./messaging.fn-Cr6KLftU.js";
import { n as createPaymentIntentFn } from "./payments.fn-bZdLCV6M.js";
import { t as Button } from "./button-D7roF92S.js";
import { t as useFavorites } from "./useFavorites-Biw4cw7b.js";
import { t as Skeleton } from "./skeleton-CRJxhCYm.js";
import { t as Input } from "./input-DBuzo6nR.js";
import { t as Separator } from "./separator-DWQzvVw_.js";
import { i as reportListingFn } from "./moderation.fn-CnOUM9at.js";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B3IsuV6e.js";
import { i as formatListingPrice, r as EDITORIAL_EASE } from "./display-cXPC5DSr.js";
import { d as similarListingsQueryOptions, i as ShareMenu, n as Toggle, r as ListingCard, s as listingDetailQueryOptions, t as MapView } from "./MapView-DsIinqAq.js";
import { t as Label } from "./label-CY_jSNfS.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Award, Bath, Bed, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, Expand, ExternalLink, Fuel, Gauge, Globe2, Heart, MapPin, Maximize, Navigation, Settings2, Users, X } from "lucide-react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import "@stripe/stripe-js";
//#region src/components/ui/textarea.tsx
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ jsx("textarea", {
		"data-slot": "textarea",
		className: cn("min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
//#endregion
//#region src/modules/listings/ui/ListingGallery.tsx
var PLACEHOLDER = "/img-placeholder.svg";
var handleImgError = (e) => {
	e.currentTarget.src = PLACEHOLDER;
	e.currentTarget.onerror = null;
};
/**
* Editorial asymmetric gallery: one tall hero on the left, 4 thumbnails
* arranged in a 2×2 grid on the right. Clicking any image opens a
* full-screen lightbox navigable with keyboard (← → Esc) and swipe.
* Layout collapses to stacked on mobile.
*/
function ListingGallery({ assets, title }) {
	const { t } = useTranslation();
	const images = assets.filter((a) => a.kind === "image");
	const [lightboxIndex, setLightboxIndex] = useState(null);
	const open = useCallback((idx) => setLightboxIndex(idx), []);
	const close = useCallback(() => setLightboxIndex(null), []);
	const next = useCallback(() => {
		setLightboxIndex((i) => i == null ? null : (i + 1) % images.length);
	}, [images.length]);
	const prev = useCallback(() => {
		setLightboxIndex((i) => i == null ? null : (i - 1 + images.length) % images.length);
	}, [images.length]);
	useEffect(() => {
		if (lightboxIndex == null) return;
		const onKey = (e) => {
			if (e.key === "ArrowRight") next();
			else if (e.key === "ArrowLeft") prev();
			else if (e.key === "Escape") close();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		lightboxIndex,
		next,
		prev,
		close
	]);
	if (images.length === 0) return null;
	const hero = images[0];
	const thumbs = images.slice(1, 5);
	const remaining = Math.max(0, images.length - 5);
	const currentLightbox = lightboxIndex != null ? images[lightboxIndex] : null;
	const hasSingle = images.length === 1;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs(m.div, {
		initial: {
			opacity: 0,
			y: 16
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .5,
			delay: .08,
			ease: EDITORIAL_EASE
		},
		className: `relative grid grid-cols-1 gap-2 md:gap-2.5 ${hasSingle ? "" : "md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"}`,
		children: [
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => open(0),
				className: `group relative overflow-hidden bg-(--surface-2) ${hasSingle ? "aspect-[16/9] md:aspect-[21/9] md:max-h-[560px]" : "aspect-[4/5] md:aspect-auto md:h-[560px]"}`,
				"aria-label": `${t("listing.viewPhoto", "View photo")} 1`,
				children: [
					/* @__PURE__ */ jsx("img", {
						src: hero.url ?? PLACEHOLDER,
						alt: hero.altText ?? title,
						className: "h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.25,1,.5,1)] group-hover:scale-[1.02]",
						loading: "eager",
						onError: handleImgError
					}),
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" }),
					/* @__PURE__ */ jsxs("span", {
						className: "absolute bottom-3 left-3 font-mono text-[0.65rem] tabular-nums text-white/90 drop-shadow",
						children: ["01 / ", String(images.length).padStart(2, "0")]
					})
				]
			}),
			thumbs.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 grid-rows-2 gap-2 md:gap-2.5",
				children: thumbs.map((img, i) => {
					const isLastWithOverflow = i === thumbs.length - 1 && remaining > 0;
					const absoluteIdx = i + 1;
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => open(absoluteIdx),
						className: "group relative aspect-[4/3] overflow-hidden bg-(--surface-2) md:aspect-auto",
						"aria-label": `${t("listing.viewPhoto", "View photo")} ${absoluteIdx + 1}`,
						children: [/* @__PURE__ */ jsx("img", {
							src: img.url ?? PLACEHOLDER,
							alt: img.altText ?? "",
							className: "h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.25,1,.5,1)] group-hover:scale-[1.04]",
							loading: "lazy",
							onError: handleImgError
						}), isLastWithOverflow && /* @__PURE__ */ jsxs("div", {
							className: "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 backdrop-blur-[2px] text-white",
							children: [
								/* @__PURE__ */ jsx(Expand, {
									className: "h-5 w-5",
									strokeWidth: 1.5
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "font-display text-xl font-medium tabular-nums leading-none",
									children: ["+", remaining]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "meta-label text-[0.6rem] text-white/80",
									children: t("listing.viewAll", "View all")
								})
							]
						})]
					}, img.id);
				})
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => open(0),
				className: "absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-(--surface-0)/95 px-3.5 py-2 text-xs font-medium text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-(--surface-0) md:bottom-4 md:right-4",
				style: { border: "1px solid var(--line-2)" },
				children: [/* @__PURE__ */ jsx(Expand, {
					className: "h-3.5 w-3.5",
					strokeWidth: 1.5
				}), /* @__PURE__ */ jsxs("span", {
					className: "meta-label",
					style: { color: "var(--ink-2)" },
					children: [
						t("listing.allPhotos", "All photos"),
						" · ",
						String(images.length).padStart(2, "0")
					]
				})]
			})
		]
	}), /* @__PURE__ */ jsx(Dialog, {
		open: lightboxIndex != null,
		onOpenChange: (v) => !v && close(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "h-[100svh] max-w-none rounded-none border-none bg-black/95 p-0 sm:h-screen md:max-w-[100vw]",
			children: [
				/* @__PURE__ */ jsx(DialogTitle, {
					className: "sr-only",
					children: title
				}),
				/* @__PURE__ */ jsx(DialogDescription, {
					className: "sr-only",
					children: t("listing.galleryDesc", "Photo gallery lightbox")
				}),
				currentLightbox && lightboxIndex != null && /* @__PURE__ */ jsxs("div", {
					className: "relative flex h-full w-full items-center justify-center",
					children: [
						/* @__PURE__ */ jsx("img", {
							src: currentLightbox.url ?? PLACEHOLDER,
							alt: currentLightbox.altText ?? title,
							className: "max-h-[88vh] max-w-[92vw] object-contain",
							onError: handleImgError
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "absolute left-4 top-4 font-mono text-xs tabular-nums text-white/85 md:left-6 md:top-6",
							children: [
								String(lightboxIndex + 1).padStart(2, "0"),
								" / ",
								String(images.length).padStart(2, "0")
							]
						}),
						/* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							onClick: close,
							className: "absolute right-4 top-4 h-9 w-9 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 md:right-6 md:top-6",
							"aria-label": t("common.close", "Close"),
							children: /* @__PURE__ */ jsx(X, {
								className: "h-5 w-5",
								strokeWidth: 1.5
							})
						}),
						images.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							onClick: prev,
							className: "absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 md:left-6",
							"aria-label": t("common.previous", "Previous"),
							children: /* @__PURE__ */ jsx(ChevronLeft, {
								className: "h-6 w-6",
								strokeWidth: 1.5
							})
						}), /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							onClick: next,
							className: "absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 md:right-6",
							"aria-label": t("common.next", "Next"),
							children: /* @__PURE__ */ jsx(ChevronRight, {
								className: "h-6 w-6",
								strokeWidth: 1.5
							})
						})] }),
						images.length > 1 && /* @__PURE__ */ jsx("div", {
							className: "absolute inset-x-0 bottom-4 mx-auto flex max-w-[min(92vw,700px)] gap-1.5 overflow-x-auto px-4 pb-1 md:bottom-6",
							children: images.map((img, i) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setLightboxIndex(i),
								className: `relative h-14 w-20 shrink-0 overflow-hidden transition-opacity ${i === lightboxIndex ? "opacity-100 ring-2 ring-white" : "opacity-50 hover:opacity-100"}`,
								children: /* @__PURE__ */ jsx("img", {
									src: img.url ?? PLACEHOLDER,
									alt: "",
									className: "h-full w-full object-cover",
									loading: "lazy",
									onError: handleImgError
								})
							}, img.id))
						})
					]
				})
			]
		})
	})] });
}
//#endregion
//#region src/modules/listings/ui/ListingStatsBar.tsx
/**
* Horizontal strip of key specs under the gallery. Tabular nums, minimal,
* editorial. Acts as a scannable summary before the long-form story.
*/
function ListingStatsBar({ listing }) {
	const { t } = useTranslation();
	const stats = [];
	if (listing.category === "property") {
		if (listing.bedrooms != null) stats.push({
			icon: Bed,
			label: t("property.beds", "Beds"),
			value: listing.bedrooms
		});
		if (listing.bathrooms != null) stats.push({
			icon: Bath,
			label: t("property.baths", "Baths"),
			value: listing.bathrooms
		});
		if (listing.areaSqm != null) stats.push({
			icon: Maximize,
			label: t("property.area", "Area"),
			value: `${listing.areaSqm} m²`
		});
		if (listing.yearBuilt != null) stats.push({
			icon: Calendar,
			label: t("property.year", "Year"),
			value: listing.yearBuilt
		});
		if (listing.parkingSpaces != null && listing.parkingSpaces > 0) stats.push({
			icon: Settings2,
			label: t("property.parking", "Parking"),
			value: listing.parkingSpaces
		});
	} else if (listing.category === "vehicle") {
		if (listing.year != null) stats.push({
			icon: Calendar,
			label: t("vehicle.year", "Year"),
			value: listing.year
		});
		if (listing.mileageKm != null) stats.push({
			icon: Gauge,
			label: t("vehicle.mileage", "Mileage"),
			value: `${listing.mileageKm.toLocaleString()} km`
		});
		if (listing.fuelType) stats.push({
			icon: Fuel,
			label: t("vehicle.fuel", "Fuel"),
			value: listing.fuelType
		});
		if (listing.transmission) stats.push({
			icon: Settings2,
			label: t("vehicle.transmission", "Transmission"),
			value: listing.transmission
		});
	} else if (listing.category === "service") {
		if (listing.experienceYears != null) stats.push({
			icon: Award,
			label: t("service.experience", "Experience"),
			value: `${listing.experienceYears} yrs`
		});
		if (listing.responseTime) stats.push({
			icon: Clock,
			label: t("service.response", "Response"),
			value: listing.responseTime
		});
		if (listing.serviceRadiusKm != null) stats.push({
			icon: Globe2,
			label: t("service.radius", "Radius"),
			value: `${listing.serviceRadiusKm} km`
		});
	} else if (listing.category === "experience") {
		if (listing.durationHours != null) stats.push({
			icon: Clock,
			label: t("experience.duration", "Duration"),
			value: `${listing.durationHours} h`
		});
		if (listing.maxGuests != null) stats.push({
			icon: Users,
			label: t("experience.maxGuests", "Max guests"),
			value: listing.maxGuests
		});
		if (listing.difficulty) stats.push({
			icon: Award,
			label: t("experience.difficulty", "Difficulty"),
			value: listing.difficulty
		});
	}
	if (stats.length === 0) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "-mx-4 flex items-stretch gap-px overflow-x-auto border-y md:mx-0",
		style: {
			borderColor: "var(--line-1)",
			backgroundColor: "var(--line-1)"
		},
		role: "list",
		children: stats.map(({ icon: Icon, label, value }) => /* @__PURE__ */ jsxs("div", {
			role: "listitem",
			className: "flex min-w-[7rem] flex-1 shrink-0 flex-col items-start gap-1 bg-background px-4 py-4 md:min-w-0 md:px-5 md:py-5",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1.5",
				style: { color: "var(--ink-3)" },
				children: [/* @__PURE__ */ jsx(Icon, {
					className: "h-3.5 w-3.5",
					strokeWidth: 1.5
				}), /* @__PURE__ */ jsx("span", {
					className: "meta-label",
					style: { fontSize: "0.625rem" },
					children: label
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "font-display text-xl font-medium tabular-nums leading-none tracking-tight text-foreground md:text-2xl",
				children: value
			})]
		}, label))
	});
}
//#endregion
//#region src/modules/listings/ui/ListingStory.tsx
/**
* Split a long description string into readable paragraphs. Handles three cases:
*   1) Text already contains blank-line breaks → respect them.
*   2) Text contains sentence delimiters (". ") → chunk by ~3 sentences.
*   3) Otherwise → return the whole string as a single paragraph.
*
* Also strips a trailing "Key property features include: ..." block so
* <ListingHighlights> can render it separately without duplication.
*/
function splitParagraphs(raw) {
	const cleaned = raw.replace(/\s+/g, " ").trim();
	let trailingBullets = null;
	const bulletsMatch = cleaned.match(/key\s+(property|vehicle|service|experience)?\s*features?\s+include\s*:/i);
	let body = cleaned;
	if (bulletsMatch && bulletsMatch.index != null) {
		body = cleaned.slice(0, bulletsMatch.index).trim();
		trailingBullets = cleaned.slice(bulletsMatch.index + bulletsMatch[0].length).trim();
	}
	if (/\n\n/.test(body)) return {
		paragraphs: body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean),
		trailingBullets
	};
	const sentences = body.split(/(?<=[.!?])\s+(?=[A-Z])/g);
	if (sentences.length <= 1) return {
		paragraphs: [body],
		trailingBullets
	};
	const SENTENCES_PER_PARA = 3;
	const paragraphs = [];
	for (let i = 0; i < sentences.length; i += SENTENCES_PER_PARA) paragraphs.push(sentences.slice(i, i + SENTENCES_PER_PARA).join(" ").trim());
	return {
		paragraphs,
		trailingBullets
	};
}
/**
* Editorial long-form narrative. First paragraph gets a drop cap. When the
* description is long (> ~1,200 chars), the body is initially collapsed
* behind a "Read more" fade.
*/
function ListingStory({ description, summary, sectionNumber = "01" }) {
	const { t } = useTranslation();
	const [expanded, setExpanded] = useState(false);
	const { paragraphs } = useMemo(() => splitParagraphs(description), [description]);
	const isLong = description.length > 1200;
	if (paragraphs.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "meta-label mb-4",
			children: [
				sectionNumber,
				" / ",
				t("listing.description", "The story")
			]
		}),
		summary && /* @__PURE__ */ jsx("p", {
			className: "mb-6 font-display text-lg font-normal italic leading-relaxed md:text-xl",
			style: { color: "var(--ink-2)" },
			children: summary
		}),
		/* @__PURE__ */ jsxs("div", {
			className: `relative transition-[max-height] duration-500 ${isLong && !expanded ? "max-h-[36rem] overflow-hidden" : "max-h-none"}`,
			children: [/* @__PURE__ */ jsx("div", {
				className: "space-y-5 text-base leading-[1.75]",
				style: { color: "var(--ink-1)" },
				children: paragraphs.map((p, idx) => {
					if (idx === 0) {
						const firstChar = p.charAt(0);
						const rest = p.slice(1);
						return /* @__PURE__ */ jsxs("p", {
							className: "first-paragraph",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "float-left mr-2 font-display font-medium leading-[0.9]",
									style: {
										fontSize: "clamp(3.2rem, 2.2rem + 2.5vw, 5rem)",
										color: "var(--amber-ink)",
										paddingTop: "0.1em",
										paddingRight: "0.05em"
									},
									"aria-hidden": "true",
									children: firstChar
								}),
								/* @__PURE__ */ jsx("span", {
									className: "sr-only",
									children: firstChar
								}),
								rest
							]
						}, idx);
					}
					return /* @__PURE__ */ jsx("p", {
						className: "max-w-[65ch]",
						children: p
					}, idx);
				})
			}), isLong && !expanded && /* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-x-0 bottom-0 h-32",
				style: { background: "linear-gradient(to bottom, transparent 0%, var(--color-background) 85%)" }
			})]
		}),
		isLong && /* @__PURE__ */ jsx("div", {
			className: "mt-4",
			children: /* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				onClick: () => setExpanded((v) => !v),
				className: "h-auto gap-1.5 rounded-none px-0 py-1 text-sm hover:bg-transparent",
				style: { color: "var(--amber-ink)" },
				children: /* @__PURE__ */ jsx("span", {
					className: "meta-label",
					children: expanded ? t("listing.readLess", "Read less") : t("listing.readMore", "Read the full story")
				})
			})
		})
	] });
}
//#endregion
//#region src/modules/listings/ui/ListingHighlights.tsx
/**
* Extract a bullet list from the tail of a description if it contains a
* "Key features include: ... " block, otherwise fall back to DB features.
* Splits by period and filters obvious non-bullet fragments.
*/
function extractBullets(description) {
	const m = description.match(/key\s+(property|vehicle|service|experience)?\s*features?\s+include\s*:?(.+)$/is);
	if (!m) return [];
	return m[2].split(/(?<=\.)\s+(?=[A-Z])/g).map((s) => s.replace(/\.$/, "").trim()).filter((s) => s.length >= 6 && s.length <= 120).slice(0, 16);
}
function humanizeFeature(code) {
	return code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function ListingHighlights({ description, features, sectionNumber = "02" }) {
	const { t } = useTranslation();
	const bullets = useMemo(() => {
		const fromDescription = extractBullets(description);
		if (fromDescription.length > 0) return fromDescription;
		return features.map(humanizeFeature);
	}, [description, features]);
	if (bullets.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("div", {
		className: "meta-label mb-4",
		children: [
			sectionNumber,
			" / ",
			t("listing.highlights", "What makes it special")
		]
	}), /* @__PURE__ */ jsx("ul", {
		className: "grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2",
		children: bullets.map((b, i) => /* @__PURE__ */ jsxs("li", {
			className: "flex items-start gap-3 border-b py-3 text-sm leading-snug",
			style: {
				borderColor: "var(--line-1)",
				color: "var(--ink-1)"
			},
			children: [/* @__PURE__ */ jsx("span", {
				className: "mt-[0.6em] block h-[0.3rem] w-[0.3rem] shrink-0 rounded-full",
				style: { backgroundColor: "var(--amber)" },
				"aria-hidden": "true"
			}), /* @__PURE__ */ jsx("span", { children: b })]
		}, i))
	})] });
}
//#endregion
//#region src/modules/listings/ui/ListingLocation.tsx
/** Extract any "N km" phrases near notable keywords to surface as proximity chips. */
function extractProximities(description) {
	if (!description) return [];
	const matches = [];
	const keywordPatterns = [
		{
			rx: /(\d{1,3})\s*(?:km|kilom\w*)[^.]{0,60}\b(airport|lufthavn)\b/gi,
			label: "proximity.airport"
		},
		{
			rx: /(\d{1,3})\s*(?:km|kilom\w*)[^.]{0,60}\b(beach|coast|sea|strand)\b/gi,
			label: "proximity.beach"
		},
		{
			rx: /(\d{1,3})\s*(?:km|kilom\w*)[^.]{0,60}\b(city|downtown|centre|center|town)\b/gi,
			label: "proximity.city"
		},
		{
			rx: /(\d{1,3})\s*(?:km|kilom\w*)[^.]{0,60}\b(station|motorway|highway|autobahn)\b/gi,
			label: "proximity.transit"
		}
	];
	const seenLabels = /* @__PURE__ */ new Set();
	for (const { rx, label } of keywordPatterns) {
		const hits = [...description.matchAll(rx)];
		for (const hit of hits.slice(0, 1)) {
			if (seenLabels.has(label)) continue;
			seenLabels.add(label);
			matches.push({
				label,
				distance: `${hit[1]} km`
			});
		}
	}
	return matches.slice(0, 4);
}
var PROXIMITY_LABELS = {
	"proximity.airport": {
		en: "to the airport",
		es: "al aeropuerto"
	},
	"proximity.beach": {
		en: "to the coast",
		es: "al mar"
	},
	"proximity.city": {
		en: "to the city centre",
		es: "al centro"
	},
	"proximity.transit": {
		en: "to transit",
		es: "a transporte"
	}
};
/**
* Section 03 — "The place". Non-interactive embed of MapView centered on the
* listing with a single marker, paired with a side panel listing address,
* neighborhood and any proximity-chips extracted from the description.
*/
function ListingLocation({ listing, sectionNumber = "03" }) {
	const { t, i18n } = useTranslation();
	const lang = i18n.language === "es" ? "es" : "en";
	const marker = {
		id: listing.id,
		slug: listing.slug,
		category: listing.category,
		price: listing.price,
		currency: listing.currency,
		latitude: listing.latitude,
		longitude: listing.longitude
	};
	const mapItem = useMemo(() => {
		const base = {
			id: listing.id,
			slug: listing.slug,
			subCategory: listing.subCategory,
			transactionType: listing.transactionType,
			status: listing.status,
			price: listing.price,
			currency: listing.currency,
			pricePeriod: listing.pricePeriod,
			latitude: listing.latitude,
			longitude: listing.longitude,
			addressLine1: listing.addressLine1,
			city: listing.city,
			region: listing.region,
			country: listing.country,
			featured: listing.featured,
			title: listing.title,
			summary: listing.summary,
			neighborhood: listing.neighborhood,
			coverUrl: listing.coverUrl,
			scrapedSource: listing.scrapedSource,
			scrapedSourceUrl: listing.scrapedSourceUrl
		};
		switch (listing.category) {
			case "property": return {
				...base,
				category: "property",
				bedrooms: listing.bedrooms ?? null,
				bathrooms: listing.bathrooms ?? null,
				areaSqm: listing.areaSqm ?? null,
				yearBuilt: listing.yearBuilt ?? null,
				parkingSpaces: listing.parkingSpaces ?? null,
				furnished: listing.furnished ?? null
			};
			case "vehicle": return {
				...base,
				category: "vehicle",
				make: listing.make ?? "",
				model: listing.model ?? "",
				year: listing.year ?? 0,
				mileageKm: listing.mileageKm ?? null,
				fuelType: listing.fuelType ?? null,
				transmission: listing.transmission ?? null,
				color: listing.color ?? null
			};
			case "service": return {
				...base,
				category: "service",
				serviceRadiusKm: listing.serviceRadiusKm ?? null,
				experienceYears: listing.experienceYears ?? null,
				responseTime: listing.responseTime ?? null
			};
			case "experience": return {
				...base,
				category: "experience",
				durationHours: listing.durationHours ?? null,
				maxGuests: listing.maxGuests ?? null,
				minAge: listing.minAge ?? null,
				difficulty: listing.difficulty ?? null,
				languages: listing.languages ?? null
			};
		}
	}, [listing]);
	const proximities = useMemo(() => extractProximities(listing.description), [listing.description]);
	return /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("div", {
		className: "meta-label mb-4",
		children: [
			sectionNumber,
			" / ",
			t("listing.location", "The place")
		]
	}), /* @__PURE__ */ jsxs("div", {
		className: "grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative h-[320px] overflow-hidden md:h-[380px]",
			style: { border: "1px solid var(--line-1)" },
			children: [/* @__PURE__ */ jsx(MapView, {
				markers: [marker],
				items: [mapItem],
				center: [listing.longitude, listing.latitude],
				zoom: 13,
				hideToolbar: true,
				hideNavControls: true,
				interactive: false
			}), /* @__PURE__ */ jsxs("div", {
				className: "pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap bg-foreground px-2.5 py-1 font-mono text-[0.65rem] tabular-nums text-background shadow-md",
				children: [
					listing.latitude.toFixed(4),
					", ",
					listing.longitude.toFixed(4)
				]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col justify-between",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-3 flex items-start gap-2",
				style: { color: "var(--ink-1)" },
				children: [/* @__PURE__ */ jsx(MapPin, {
					className: "mt-0.5 h-4 w-4 shrink-0",
					strokeWidth: 1.5,
					style: { color: "var(--amber-ink)" }
				}), /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-display text-xl font-medium leading-tight text-foreground md:text-2xl",
						children: listing.city
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-sm",
						style: { color: "var(--ink-2)" },
						children: [
							listing.neighborhood ? `${listing.neighborhood} · ` : "",
							listing.region ? `${listing.region}, ` : "",
							listing.country
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs",
						style: { color: "var(--ink-3)" },
						children: listing.addressLine1
					})
				] })]
			}), proximities.length > 0 && /* @__PURE__ */ jsx("dl", {
				className: "mt-5 divide-y",
				style: {
					borderTop: "1px solid var(--line-1)",
					borderBottom: "1px solid var(--line-1)"
				},
				children: proximities.map((p) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-4 py-2.5",
					style: { borderColor: "var(--line-1)" },
					children: [/* @__PURE__ */ jsxs("dt", {
						className: "flex items-center gap-2 text-sm",
						style: { color: "var(--ink-2)" },
						children: [/* @__PURE__ */ jsx(Navigation, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.5
						}), PROXIMITY_LABELS[p.label][lang]]
					}), /* @__PURE__ */ jsx("dd", {
						className: "font-display text-base font-medium tabular-nums text-foreground",
						children: p.distance
					})]
				}, p.label))
			})] }), /* @__PURE__ */ jsx("p", {
				className: "mt-6 text-xs",
				style: { color: "var(--ink-3)" },
				children: t("listing.locationNote", "Approximate location — exact address shared after inquiry.")
			})]
		})]
	})] });
}
//#endregion
//#region src/modules/listings/ui/ListingSource.tsx
var SOURCE_LABELS = {
	airbnb: "Airbnb",
	facebook: "Facebook",
	"facebook-events": "Facebook Events",
	linkedin: "LinkedIn",
	edc: "EDC",
	boliga: "Boliga",
	homestra: "Homestra",
	boligsiden: "Boligsiden"
};
var SOURCE_COLORS = {
	airbnb: "#FF5A5F",
	facebook: "#1877F2",
	"facebook-events": "#9333EA",
	linkedin: "#0A66C2",
	edc: "#E30613",
	boliga: "#0B6EAD",
	homestra: "#1F6F54",
	boligsiden: "#003865"
};
/**
* Editorial attribution chip. When `variant='block'` it renders a full
* card suitable for the sidebar; `variant='inline'` is a slim tag.
*/
function ListingSource({ scrapedSource, scrapedSourceUrl, variant = "block" }) {
	const { t } = useTranslation();
	if (!scrapedSource) return null;
	const label = SOURCE_LABELS[scrapedSource] ?? scrapedSource;
	const color = SOURCE_COLORS[scrapedSource] ?? "var(--ink-2)";
	const href = scrapedSourceUrl ?? void 0;
	if (variant === "inline") return /* @__PURE__ */ jsxs(href ? "a" : "span", {
		href,
		target: href ? "_blank" : void 0,
		rel: href ? "noopener noreferrer" : void 0,
		className: "inline-flex items-center gap-1 text-[0.7rem] font-medium underline-offset-2 hover:underline",
		style: { color },
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "h-1.5 w-1.5 rounded-full",
				style: { backgroundColor: color },
				"aria-hidden": "true"
			}),
			label,
			href && /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" })
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "border p-4",
		style: { borderColor: "var(--line-1)" },
		children: [/* @__PURE__ */ jsx("div", {
			className: "meta-label mb-2",
			style: { color: "var(--ink-3)" },
			children: t("listing.sourceOriginally", "Originally published on")
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 text-sm font-medium",
				style: { color: "var(--ink-1)" },
				children: [/* @__PURE__ */ jsx("span", {
					className: "h-2 w-2 rounded-full",
					style: { backgroundColor: color },
					"aria-hidden": "true"
				}), label]
			}), href && /* @__PURE__ */ jsxs("a", {
				href,
				target: "_blank",
				rel: "noopener noreferrer",
				className: "inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline",
				style: { color: "var(--amber-ink)" },
				children: [t("listing.viewOriginal", "View original"), /* @__PURE__ */ jsx(ExternalLink, {
					className: "h-3 w-3",
					strokeWidth: 1.5
				})]
			})]
		})]
	});
}
//#endregion
//#region src/modules/listings/ui/ListingSimilar.tsx
/** Row of 3 compact cards with listings matching the same category (and city, when possible). */
function ListingSimilar({ category, city, excludeId, sectionNumber = "05" }) {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { data: items, isLoading } = useQuery(similarListingsQueryOptions(category, city, excludeId, 3, i18n.language));
	if (!isLoading && (!items || items.length === 0)) return null;
	return /* @__PURE__ */ jsxs("section", {
		className: "mt-16 md:mt-24",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-6 flex items-end justify-between gap-4",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "meta-label mb-2",
				children: [
					sectionNumber,
					" / ",
					t("listing.similar", "You may also like")
				]
			}), /* @__PURE__ */ jsx("h2", {
				className: "font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl",
				children: city ? t("listing.moreInCity", {
					defaultValue: "More in {{city}}",
					city
				}) : t("listing.moreLike", "More like this")
			})] }), /* @__PURE__ */ jsxs(Button, {
				variant: "ghost",
				onClick: () => navigate({
					to: "/explore",
					search: { category }
				}),
				className: "h-auto gap-1 rounded-none px-0 py-0 text-sm hover:bg-transparent",
				style: { color: "var(--amber-ink)" },
				children: [/* @__PURE__ */ jsx("span", {
					className: "meta-label",
					children: t("common.exploreAll", "Explore all")
				}), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })]
			})]
		}), isLoading ? /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6",
			children: [
				0,
				1,
				2
			].map((i) => /* @__PURE__ */ jsx("div", { className: "aspect-[3/4] animate-pulse bg-(--surface-2)" }, i))
		}) : /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6",
			children: items?.map((it) => /* @__PURE__ */ jsx(ListingCard, {
				item: it,
				variant: "compact",
				onSelect: () => navigate({
					to: "/listing/$slug",
					params: { slug: it.slug }
				})
			}, it.id))
		})]
	});
}
//#endregion
//#region src/modules/listings/ui/ContactButton.tsx
/**
* Marketplace contact-button.
*
* For listings whose `contactMethod === 'in_app'` (multi-tenant flow), this
* starts a Thread with the owner via `startThreadFn` and navigates the buyer
* to the message thread. For other contact methods, the parent should not
* render this — display the email/phone/url directly.
*/
function ContactButton({ listingId, className, label = "Contact seller" }) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [body, setBody] = useState("");
	const [err, setErr] = useState(null);
	const start = useMutation({
		mutationFn: () => startThreadFn({ data: {
			listingId,
			body: body.trim()
		} }),
		onSuccess: (res) => {
			navigate({
				to: "/account/messages/$threadId",
				params: { threadId: res.threadId }
			});
		},
		onError: (e) => setErr(e.message ?? "Could not start conversation")
	});
	if (!open) return /* @__PURE__ */ jsx("button", {
		type: "button",
		onClick: () => setOpen(true),
		className: className ?? "rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900",
		children: label
	});
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: (e) => {
			e.preventDefault();
			if (body.trim().length === 0) return;
			start.mutate();
		},
		className: "space-y-3 rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900",
		children: [
			/* @__PURE__ */ jsx("textarea", {
				value: body,
				onChange: (e) => setBody(e.currentTarget.value),
				rows: 4,
				maxLength: 4e3,
				placeholder: "Hi! I'm interested in your listing…",
				className: "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950"
			}),
			err && /* @__PURE__ */ jsx("p", {
				className: "text-xs text-red-600",
				children: err
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-end gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setOpen(false),
					className: "px-3 py-1 text-xs text-neutral-500 hover:underline",
					children: "Cancel"
				}), /* @__PURE__ */ jsx("button", {
					type: "submit",
					disabled: start.isPending || body.trim().length === 0,
					className: "rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900",
					children: start.isPending ? "Sending…" : "Send"
				})]
			})
		]
	});
}
//#endregion
//#region src/modules/listings/ui/ReportButton.tsx
/**
* Report-listing button. Opens a small modal, lets the user pick a reason +
* note, and POSTs `reportListingFn`. Shows confirmation on success.
*/
var REASONS = [
	["spam", "Spam"],
	["fraud", "Fraud / scam"],
	["illegal", "Illegal item or activity"],
	["duplicate", "Duplicate listing"],
	["wrong_category", "Wrong category"],
	["inappropriate", "Inappropriate content"],
	["other", "Other"]
];
function ReportButton({ listingId }) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState("spam");
	const [note, setNote] = useState("");
	const [done, setDone] = useState(false);
	const [err, setErr] = useState(null);
	const report = useMutation({
		mutationFn: () => reportListingFn({ data: {
			listingId,
			reason,
			details: note.trim() === "" ? void 0 : note.trim()
		} }),
		onSuccess: () => setDone(true),
		onError: (e) => setErr(e.message ?? "Could not submit report")
	});
	if (!open) return /* @__PURE__ */ jsx("button", {
		type: "button",
		onClick: () => setOpen(true),
		className: "text-xs text-neutral-500 underline hover:text-red-600",
		children: "Report this listing"
	});
	return /* @__PURE__ */ jsx("div", {
		className: "rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900",
		children: done ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", {
			className: "text-sm text-emerald-600",
			children: "Thanks — we’ll review this listing."
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => {
				setOpen(false);
				setDone(false);
				setNote("");
			},
			className: "mt-3 text-xs text-neutral-500 underline",
			children: "Close"
		})] }) : /* @__PURE__ */ jsxs("form", {
			onSubmit: (e) => {
				e.preventDefault();
				report.mutate();
			},
			className: "space-y-3",
			children: [
				/* @__PURE__ */ jsx("h3", {
					className: "text-sm font-medium",
					children: "Report listing"
				}),
				/* @__PURE__ */ jsx("select", {
					value: reason,
					onChange: (e) => setReason(e.currentTarget.value),
					className: "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950",
					children: REASONS.map(([v, l]) => /* @__PURE__ */ jsx("option", {
						value: v,
						children: l
					}, v))
				}),
				/* @__PURE__ */ jsx("textarea", {
					value: note,
					onChange: (e) => setNote(e.currentTarget.value),
					rows: 3,
					maxLength: 2e3,
					placeholder: "Optional note for moderators",
					className: "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
				}),
				err && /* @__PURE__ */ jsx("p", {
					className: "text-xs text-red-600",
					children: err
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-end gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setOpen(false),
						className: "text-xs text-neutral-500 hover:underline",
						children: "Cancel"
					}), /* @__PURE__ */ jsx("button", {
						type: "submit",
						disabled: report.isPending,
						className: "rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50",
						children: report.isPending ? "Submitting…" : "Submit report"
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/modules/listings/ui/StripeCheckoutButton.tsx
/**
* Stripe Elements checkout button.
*
* Two-stage flow:
*  1. Click "Buy" → we POST `createPaymentIntentFn` to get a `client_secret`
*     for the listing/seller's connected account (with `application_fee_amount`).
*  2. We mount Stripe `<Elements>` with `<PaymentElement>` and confirm. On
*     success Stripe redirects to `return_url` which lands on
*     `/account/payments` where the webhook will have already marked the
*     payment succeeded.
*
* SECURITY: PaymentIntent creation runs server-side (with auth + rate limit).
* The client never sees seller account ids — only the public client secret.
*/
var stripePromise = null;
function getStripeJs() {
	if (stripePromise) return stripePromise;
	console.warn("[StripeCheckoutButton] VITE_STRIPE_PUBLISHABLE_KEY is not set");
	return Promise.resolve(null);
}
function StripeCheckoutButton(props) {
	const [clientSecret, setClientSecret] = useState(null);
	const [paymentId, setPaymentId] = useState(null);
	const [err, setErr] = useState(null);
	const [creating, setCreating] = useState(false);
	if (!clientSecret) return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("button", {
		type: "button",
		disabled: creating,
		onClick: async () => {
			setErr(null);
			setCreating(true);
			try {
				const res = await createPaymentIntentFn({ data: {
					listingId: props.listingId,
					amount: props.amount,
					currency: props.currency,
					intent: props.intent
				} });
				if (!res.clientSecret) throw new Error("Payment could not be initiated");
				setClientSecret(res.clientSecret);
				setPaymentId(res.paymentId);
			} catch (e) {
				setErr(e.message ?? "Could not start checkout");
			} finally {
				setCreating(false);
			}
		},
		className: "rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50",
		children: creating ? "Loading…" : props.label ?? `Buy now · ${(props.amount / 100).toFixed(2)} ${props.currency}`
	}), err && /* @__PURE__ */ jsx("p", {
		className: "mt-2 text-xs text-red-600",
		children: err
	})] });
	return /* @__PURE__ */ jsx(Elements, {
		stripe: getStripeJs(),
		options: { clientSecret },
		children: /* @__PURE__ */ jsx(CheckoutForm, { paymentId })
	});
}
function CheckoutForm({ paymentId }) {
	const stripe = useStripe();
	const elements = useElements();
	const [submitting, setSubmitting] = useState(false);
	const [err, setErr] = useState(null);
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: async (e) => {
			e.preventDefault();
			if (!stripe || !elements) return;
			setSubmitting(true);
			setErr(null);
			const { error } = await stripe.confirmPayment({
				elements,
				confirmParams: { return_url: `${window.location.origin}/account/payments?p=${paymentId}` }
			});
			if (error) {
				setErr(error.message ?? "Payment failed");
				setSubmitting(false);
			}
		},
		className: "space-y-3 rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900",
		children: [
			/* @__PURE__ */ jsx(PaymentElement, {}),
			err && /* @__PURE__ */ jsx("p", {
				className: "text-xs text-red-600",
				children: err
			}),
			/* @__PURE__ */ jsx("button", {
				type: "submit",
				disabled: !stripe || submitting,
				className: "w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50",
				children: submitting ? "Processing…" : "Pay"
			})
		]
	});
}
//#endregion
//#region src/modules/listings/ui/ListingDetailPage.tsx
function ListingDetailPage({ slug }) {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { data: listing, isLoading, isError } = useQuery(listingDetailQueryOptions(slug, i18n.language));
	const [contactOpen, setContactOpen] = useState(false);
	const [bookingOpen, setBookingOpen] = useState(false);
	const { isFavorite, toggle: toggleFavorite } = useFavorites();
	if (isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-[1400px] space-y-8 px-6 pb-32 pt-6 md:px-10",
		children: [
			/* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-48" }),
			/* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-3/4" }),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 gap-2 md:grid-cols-[1.55fr_1fr]",
				children: [/* @__PURE__ */ jsx(Skeleton, { className: "h-[560px] w-full" }), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 grid-rows-2 gap-2",
					children: [
						/* @__PURE__ */ jsx(Skeleton, {}),
						/* @__PURE__ */ jsx(Skeleton, {}),
						/* @__PURE__ */ jsx(Skeleton, {}),
						/* @__PURE__ */ jsx(Skeleton, {})
					]
				})]
			})
		]
	});
	if (isError || !listing) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center gap-4 p-16 text-center",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-lg text-muted-foreground",
			children: t("listing.notFound", "Listing not found")
		}), /* @__PURE__ */ jsx(Button, {
			variant: "outline",
			onClick: () => navigate({ to: "/explore" }),
			children: t("listing.backToExplore", "Back to explore")
		})]
	});
	const { amount: formattedPrice, suffix: priceSuffix } = formatListingPrice(listing.price, listing.currency, listing.pricePeriod, i18n.language);
	return /* @__PURE__ */ jsxs(m.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		transition: { duration: .3 },
		className: "mx-auto max-w-[1400px] px-6 pb-32 pt-6 md:pb-24 md:px-10",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-8 flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					onClick: () => navigate({ to: "/explore" }),
					className: "group h-auto gap-2 rounded-none px-0 py-0 text-sm hover:bg-transparent hover:text-foreground",
					style: { color: "var(--ink-2)" },
					children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" }), /* @__PURE__ */ jsx("span", {
						className: "meta-label",
						children: t("listing.back", "Back")
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ jsx(ShareMenu, {
						title: listing.title,
						text: listing.summary ?? void 0,
						ariaLabel: t("share.label", "Share listing")
					}), /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "rounded-none hover:text-(--red)",
						style: { color: isFavorite(listing.id) ? "var(--red)" : "var(--ink-3)" },
						"aria-label": isFavorite(listing.id) ? t("listing.unfavorite", "Remove from favorites") : t("listing.favorite", "Save to favorites"),
						onClick: () => toggleFavorite(listing.id),
						children: /* @__PURE__ */ jsx(Heart, {
							className: "h-4 w-4",
							strokeWidth: 1.5,
							style: { fill: isFavorite(listing.id) ? "var(--red)" : "transparent" }
						})
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("header", {
				className: "mb-8 grid grid-cols-12 gap-6 md:mb-10",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "col-span-12 md:col-span-9",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-5 flex flex-wrap items-center gap-x-3 gap-y-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "meta-label",
									style: { color: "var(--amber-ink)" },
									children: listing.transactionType
								}),
								/* @__PURE__ */ jsx("span", {
									style: { color: "var(--ink-4)" },
									children: "·"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "meta-label",
									style: { color: "var(--ink-3)" },
									children: listing.category
								}),
								/* @__PURE__ */ jsx("span", {
									style: { color: "var(--ink-4)" },
									children: "·"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "meta-label",
									style: { color: "var(--ink-3)" },
									children: listing.subCategory
								}),
								listing.scrapedSource && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
									style: { color: "var(--ink-4)" },
									children: "·"
								}), /* @__PURE__ */ jsx(ListingSource, {
									scrapedSource: listing.scrapedSource,
									scrapedSourceUrl: listing.scrapedSourceUrl,
									variant: "inline"
								})] })
							]
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "font-display text-[clamp(2.25rem,1.6rem+3vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-foreground",
							children: listing.title
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-5 flex items-center gap-1.5 text-sm",
							style: { color: "var(--ink-2)" },
							children: [/* @__PURE__ */ jsx(MapPin, {
								className: "h-3.5 w-3.5",
								strokeWidth: 1.5
							}), [
								listing.addressLine1,
								listing.city,
								listing.country
							].filter(Boolean).join(", ")]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "col-span-12 flex items-end justify-start md:col-span-3 md:justify-end",
					children: /* @__PURE__ */ jsxs("div", {
						className: "text-left md:text-right",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "meta-label mb-1",
								style: { color: "var(--ink-3)" },
								children: t("editorial.price", "Price")
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-display text-3xl font-medium tabular-nums tracking-[-0.015em] text-foreground md:text-4xl",
								children: formattedPrice
							}),
							priceSuffix && /* @__PURE__ */ jsx("p", {
								className: "text-xs tabular-nums",
								style: { color: "var(--ink-3)" },
								children: priceSuffix
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ jsx(ListingGallery, {
				assets: listing.assets,
				title: listing.title
			}),
			/* @__PURE__ */ jsx(m.div, {
				initial: {
					opacity: 0,
					y: 12
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .4,
					delay: .15,
					ease: EDITORIAL_EASE
				},
				className: "mt-8 md:mt-12",
				children: /* @__PURE__ */ jsx(ListingStatsBar, { listing })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-10 grid grid-cols-12 gap-x-8 gap-y-12 md:mt-14",
				children: [/* @__PURE__ */ jsxs(m.div, {
					initial: {
						opacity: 0,
						y: 16
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .4,
						delay: .2,
						ease: EDITORIAL_EASE
					},
					className: "col-span-12 space-y-12 md:col-span-8",
					children: [
						listing.description && /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx(ListingStory, {
								description: listing.description,
								summary: listing.summary,
								sectionNumber: "01"
							}),
							/* @__PURE__ */ jsx(Separator, {}),
							/* @__PURE__ */ jsx(ListingHighlights, {
								description: listing.description,
								features: listing.features,
								sectionNumber: "02"
							})
						] }),
						/* @__PURE__ */ jsx(Separator, {}),
						/* @__PURE__ */ jsx(ListingLocation, {
							listing,
							sectionNumber: "03"
						})
					]
				}), /* @__PURE__ */ jsx(m.aside, {
					initial: {
						opacity: 0,
						y: 16
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .4,
						delay: .26,
						ease: EDITORIAL_EASE
					},
					className: "col-span-12 md:col-span-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "sticky top-24 space-y-5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "border p-5",
								style: { borderColor: "var(--line-1)" },
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "meta-label mb-2",
										style: { color: "var(--ink-3)" },
										children: t("editorial.price", "Price")
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mb-5 font-display text-3xl font-medium tabular-nums tracking-tight text-foreground md:text-4xl",
										children: [formattedPrice, priceSuffix && /* @__PURE__ */ jsx("span", {
											className: "ml-1 text-base font-normal",
											style: { color: "var(--ink-3)" },
											children: priceSuffix
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "hidden space-y-2 md:block",
										children: [
											listing.sourceKind === "user" && listing.contactMethod === "in_app" && listing.ownerId ? /* @__PURE__ */ jsx(ContactButton, {
												listingId: listing.id,
												ownerId: listing.ownerId,
												label: listing.category === "service" ? t("listing.requestService", "Request service") : t("listing.contact", "Contact seller"),
												className: "h-auto w-full rounded-none bg-foreground px-6 py-4 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)"
											}) : /* @__PURE__ */ jsx(Button, {
												onClick: () => setContactOpen(true),
												className: "h-auto w-full rounded-none bg-foreground px-6 py-4 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)",
												children: listing.category === "service" ? t("listing.requestService", "Request service") : t("listing.contact", "Contact seller")
											}),
											/* @__PURE__ */ jsx(Button, {
												variant: "outline",
												onClick: () => setBookingOpen(true),
												className: "h-auto w-full rounded-none px-6 py-4 text-sm font-medium hover:bg-(--surface-2)",
												children: t("listing.bookTour", "Book a tour")
											}),
											listing.sourceKind === "user" && listing.ownerId && listing.price >= .5 ? /* @__PURE__ */ jsx(StripeCheckoutButton, {
												listingId: listing.id,
												amount: Math.round(listing.price * 100),
												currency: listing.currency || "DKK",
												intent: listing.category === "service" ? "service" : listing.category === "experience" ? "booking" : "sale",
												label: t("listing.buyNow", "Pay securely · {{price}} {{currency}}", {
													price: listing.price.toLocaleString(),
													currency: listing.currency || "DKK"
												})
											}) : null
										]
									})
								]
							}),
							listing.scrapedSource && /* @__PURE__ */ jsx(ListingSource, {
								scrapedSource: listing.scrapedSource,
								scrapedSourceUrl: listing.scrapedSourceUrl,
								variant: "block"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "text-xs",
								style: { color: "var(--ink-3)" },
								children: [/* @__PURE__ */ jsxs("p", { children: [
									t("listing.published", "Published"),
									" ",
									/* @__PURE__ */ jsx("span", {
										className: "tabular-nums",
										children: listing.publishedAt ? new Date(listing.publishedAt).toLocaleDateString(i18n.language === "es" ? "es-ES" : "en-DK", {
											day: "2-digit",
											month: "short",
											year: "numeric"
										}) : "—"
									})
								] }), /* @__PURE__ */ jsx("div", {
									className: "mt-3",
									children: /* @__PURE__ */ jsx(ReportButton, { listingId: listing.id })
								})]
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ jsx(ListingSimilar, {
				category: listing.category,
				city: listing.city,
				excludeId: listing.id,
				sectionNumber: "04"
			}),
			/* @__PURE__ */ jsx(ContactDialog, {
				open: contactOpen,
				onOpenChange: setContactOpen,
				listingTitle: listing.title,
				isService: listing.category === "service"
			}),
			/* @__PURE__ */ jsx(BookingDialog, {
				open: bookingOpen,
				onOpenChange: setBookingOpen,
				listingTitle: listing.title
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-border bg-background/95 p-4 backdrop-blur-sm md:hidden",
				children: [listing.sourceKind === "user" && listing.contactMethod === "in_app" && listing.ownerId ? /* @__PURE__ */ jsx(ContactButton, {
					listingId: listing.id,
					ownerId: listing.ownerId,
					label: listing.category === "service" ? t("listing.requestService", "Request service") : t("listing.contact", "Contact seller"),
					className: "h-auto flex-1 rounded-none bg-foreground py-3.5 text-sm font-medium text-background active:opacity-80"
				}) : /* @__PURE__ */ jsx(Button, {
					onClick: () => setContactOpen(true),
					className: "h-auto flex-1 rounded-none bg-foreground py-3.5 text-sm font-medium text-background active:opacity-80",
					children: listing.category === "service" ? t("listing.requestService", "Request service") : t("listing.contact", "Contact seller")
				}), /* @__PURE__ */ jsx(Button, {
					variant: "outline",
					onClick: () => setBookingOpen(true),
					className: "h-auto flex-1 rounded-none py-3.5 text-sm font-medium active:bg-(--surface-2)",
					children: t("listing.bookTour", "Book a tour")
				})]
			})
		]
	});
}
function ContactDialog({ open, onOpenChange, listingTitle, isService }) {
	const { t } = useTranslation();
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		message: ""
	});
	const [submitted, setSubmitted] = useState(false);
	const handleSubmit = (e) => {
		e.preventDefault();
		setSubmitted(true);
	};
	const handleClose = (v) => {
		if (!v) {
			setForm({
				name: "",
				email: "",
				phone: "",
				message: ""
			});
			setSubmitted(false);
		}
		onOpenChange(v);
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange: handleClose,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, {
				className: "font-display text-xl font-medium",
				children: isService ? t("listing.requestService", "Request service") : t("listing.contact", "Contact seller")
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm",
				style: { color: "var(--ink-3)" },
				children: listingTitle
			})] }), submitted ? /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center gap-3 py-8 text-center",
				children: [
					/* @__PURE__ */ jsx(CheckCircle2, {
						className: "h-10 w-10",
						style: { color: "var(--amber)" },
						strokeWidth: 1.5
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-medium text-foreground",
						children: t("contact.sent", "Your message has been sent!")
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm",
						style: { color: "var(--ink-3)" },
						children: t("contact.sentDesc", "The seller will get back to you shortly.")
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "link",
						onClick: () => handleClose(false),
						className: "mt-2 h-auto p-0 text-sm",
						style: { color: "var(--ink-3)" },
						children: t("common.close", "Close")
					})
				]
			}) : /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "mt-2 space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsxs(Label, {
								htmlFor: "contact-name",
								className: "text-xs",
								children: [t("contact.name", "Name"), " *"]
							}), /* @__PURE__ */ jsx(Input, {
								id: "contact-name",
								required: true,
								value: form.name,
								onChange: (e) => setForm((f) => ({
									...f,
									name: e.target.value
								})),
								placeholder: "Jane Smith"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "contact-phone",
								className: "text-xs",
								children: t("contact.phone", "Phone")
							}), /* @__PURE__ */ jsx(Input, {
								id: "contact-phone",
								type: "tel",
								value: form.phone,
								onChange: (e) => setForm((f) => ({
									...f,
									phone: e.target.value
								})),
								placeholder: "+45 000 000 00"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsxs(Label, {
							htmlFor: "contact-email",
							className: "text-xs",
							children: [t("contact.email", "Email"), " *"]
						}), /* @__PURE__ */ jsx(Input, {
							id: "contact-email",
							type: "email",
							required: true,
							value: form.email,
							onChange: (e) => setForm((f) => ({
								...f,
								email: e.target.value
							})),
							placeholder: "jane@example.com"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsxs(Label, {
							htmlFor: "contact-message",
							className: "text-xs",
							children: [t("contact.message", "Message"), " *"]
						}), /* @__PURE__ */ jsx(Textarea, {
							id: "contact-message",
							required: true,
							rows: 4,
							value: form.message,
							onChange: (e) => setForm((f) => ({
								...f,
								message: e.target.value
							})),
							placeholder: t("contact.messagePlaceholder", "Hi, I am interested in this listing..."),
							className: "resize-none"
						})]
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						className: "h-auto w-full rounded-none bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)",
						children: t("contact.send", "Send message")
					})
				]
			})]
		})
	});
}
var TIME_SLOTS = [
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00"
];
function BookingDialog({ open, onOpenChange, listingTitle }) {
	const { t } = useTranslation();
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		date: "",
		time: "",
		notes: ""
	});
	const [submitted, setSubmitted] = useState(false);
	const handleSubmit = (e) => {
		e.preventDefault();
		setSubmitted(true);
	};
	const handleClose = (v) => {
		if (!v) {
			setForm({
				name: "",
				email: "",
				phone: "",
				date: "",
				time: "",
				notes: ""
			});
			setSubmitted(false);
		}
		onOpenChange(v);
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange: handleClose,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, {
				className: "font-display text-xl font-medium",
				children: t("listing.bookTour", "Book a tour")
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm",
				style: { color: "var(--ink-3)" },
				children: listingTitle
			})] }), submitted ? /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center gap-3 py-8 text-center",
				children: [
					/* @__PURE__ */ jsx(CheckCircle2, {
						className: "h-10 w-10",
						style: { color: "var(--amber)" },
						strokeWidth: 1.5
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-medium text-foreground",
						children: t("booking.confirmed", "Visit booked!")
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm",
						style: { color: "var(--ink-3)" },
						children: form.date && form.time ? `${form.date} · ${form.time}` : t("booking.confirmedDesc", "The seller will confirm your visit shortly.")
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "link",
						onClick: () => handleClose(false),
						className: "mt-2 h-auto p-0 text-sm",
						style: { color: "var(--ink-3)" },
						children: t("common.close", "Close")
					})
				]
			}) : /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "mt-2 space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsxs(Label, {
								htmlFor: "booking-name",
								className: "text-xs",
								children: [t("contact.name", "Name"), " *"]
							}), /* @__PURE__ */ jsx(Input, {
								id: "booking-name",
								required: true,
								value: form.name,
								onChange: (e) => setForm((f) => ({
									...f,
									name: e.target.value
								})),
								placeholder: "Jane Smith"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "booking-phone",
								className: "text-xs",
								children: t("contact.phone", "Phone")
							}), /* @__PURE__ */ jsx(Input, {
								id: "booking-phone",
								type: "tel",
								value: form.phone,
								onChange: (e) => setForm((f) => ({
									...f,
									phone: e.target.value
								})),
								placeholder: "+45 000 000 00"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsxs(Label, {
							htmlFor: "booking-email",
							className: "text-xs",
							children: [t("contact.email", "Email"), " *"]
						}), /* @__PURE__ */ jsx(Input, {
							id: "booking-email",
							type: "email",
							required: true,
							value: form.email,
							onChange: (e) => setForm((f) => ({
								...f,
								email: e.target.value
							})),
							placeholder: "jane@example.com"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsxs(Label, {
								htmlFor: "booking-date",
								className: "text-xs",
								children: [t("booking.date", "Date"), " *"]
							}), /* @__PURE__ */ jsx(Input, {
								id: "booking-date",
								type: "date",
								required: true,
								min: today,
								value: form.date,
								onChange: (e) => setForm((f) => ({
									...f,
									date: e.target.value
								}))
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsxs(Label, {
								className: "text-xs",
								children: [t("booking.time", "Time"), " *"]
							}), /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-2 gap-1",
								children: TIME_SLOTS.map((slot) => /* @__PURE__ */ jsx(Toggle, {
									pressed: form.time === slot,
									onPressedChange: () => setForm((f) => ({
										...f,
										time: slot
									})),
									variant: "outline",
									size: "sm",
									className: "h-auto w-full rounded px-2 py-1 text-xs data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background",
									children: slot
								}, slot))
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "booking-notes",
							className: "text-xs",
							children: t("booking.notes", "Notes")
						}), /* @__PURE__ */ jsx(Textarea, {
							id: "booking-notes",
							rows: 2,
							value: form.notes,
							onChange: (e) => setForm((f) => ({
								...f,
								notes: e.target.value
							})),
							placeholder: t("booking.notesPlaceholder", "Any specific requests or questions..."),
							className: "resize-none"
						})]
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: !form.time,
						className: "h-auto w-full rounded-none bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)",
						children: t("booking.confirm", "Confirm visit")
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/routes/_public/listing/$slug.tsx?tsr-split=component
function ListingDetailRoute() {
	const { slug } = Route.useParams();
	return /* @__PURE__ */ jsx(ListingDetailPage, { slug });
}
//#endregion
export { ListingDetailRoute as component };
