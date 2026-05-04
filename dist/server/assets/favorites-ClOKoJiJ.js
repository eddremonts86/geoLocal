import { u as useAuth } from "./dist-TPNQHynL.js";
import { t as Button } from "./button-D7roF92S.js";
import { i as clearFavoritesFn, n as favoriteKeys, r as favoritesListQueryOptions, t as useFavorites } from "./useFavorites-Biw4cw7b.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Heart, Trash2 } from "lucide-react";
//#region src/routes/_public/favorites.tsx?tsr-split=component
function FavoritesPage() {
	const { t, i18n } = useTranslation();
	const { isSignedIn, isLoaded } = useAuth();
	const qc = useQueryClient();
	const { toggle, isFavorite } = useFavorites();
	const { data, isLoading } = useQuery({
		...favoritesListQueryOptions(i18n.language === "es" ? "es" : "en", 60, 0),
		enabled: isLoaded && !!isSignedIn
	});
	const clearMutation = useMutation({
		mutationFn: () => clearFavoritesFn({ data: {} }),
		onSuccess: () => qc.invalidateQueries({ queryKey: favoriteKeys.all })
	});
	if (isLoaded && !isSignedIn) return /* @__PURE__ */ jsxs("section", {
		className: "mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32",
		children: [
			/* @__PURE__ */ jsxs("span", {
				className: "meta-label",
				children: ["01 · ", t("favorites.label", "Favorites")]
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "mt-4 font-display text-[clamp(2.5rem,1.8rem+3.2vw,5rem)] font-medium leading-[0.95] tracking-[-0.02em] text-foreground",
				children: t("favorites.signedOutTitle", "Save what you love.")
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 max-w-xl text-lg leading-relaxed",
				style: { color: "var(--ink-2)" },
				children: t("favorites.signedOutLede", "Sign in to save properties, vehicles, services, and experiences you want to come back to.")
			}),
			/* @__PURE__ */ jsxs(Link, {
				to: "/sign-in",
				className: "mt-10 inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-(--amber-ink)",
				children: [t("favorites.signIn", "Sign in"), /* @__PURE__ */ jsx(ArrowUpRight, {
					className: "h-4 w-4",
					strokeWidth: 1.5
				})]
			})
		]
	});
	const items = data?.items ?? [];
	return /* @__PURE__ */ jsxs("section", {
		className: "mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12 flex items-end justify-between gap-6 md:mb-16",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "meta-label",
							children: ["01 · ", t("favorites.label", "Favorites")]
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "font-display text-[clamp(2rem,1.6rem+2vw,3.5rem)] font-medium leading-none tracking-[-0.02em] text-foreground",
							children: t("favorites.title", "Your shortlist")
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm tabular-nums",
							style: { color: "var(--ink-3)" },
							children: isLoading ? t("favorites.loading", "Loading…") : t("favorites.count", "{{count}} saved", { count: data?.total ?? 0 })
						})
					]
				}), items.length > 0 && /* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					size: "sm",
					className: "meta-label rounded-none",
					style: { color: "var(--ink-3)" },
					onClick: () => {
						if (confirm(t("favorites.clearConfirm", "Clear all favorites?"))) clearMutation.mutate();
					},
					disabled: clearMutation.isPending,
					children: [/* @__PURE__ */ jsx(Trash2, {
						className: "mr-2 h-3.5 w-3.5",
						strokeWidth: 1.5
					}), t("favorites.clearAll", "Clear all")]
				})]
			}),
			isLoading && /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-72 animate-pulse bg-(--surface-2)" }, i))
			}),
			!isLoading && items.length === 0 && /* @__PURE__ */ jsxs("div", {
				className: "border border-(--line-1) bg-(--surface-2) px-6 py-20 text-center md:py-28",
				children: [
					/* @__PURE__ */ jsx(Heart, {
						className: "mx-auto mb-6 h-8 w-8",
						strokeWidth: 1,
						style: { color: "var(--ink-4)" }
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "font-display text-3xl font-medium tracking-[-0.01em]",
						children: t("favorites.emptyTitle", "Nothing saved yet.")
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mx-auto mt-4 max-w-md text-sm leading-relaxed",
						style: { color: "var(--ink-3)" },
						children: t("favorites.emptyLede", "Tap the heart on any listing — properties, vehicles, services, or experiences — to gather them here.")
					}),
					/* @__PURE__ */ jsxs(Link, {
						to: "/explore",
						className: "mt-8 inline-flex items-center gap-2 border border-foreground px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background",
						children: [t("favorites.exploreCta", "Start exploring"), /* @__PURE__ */ jsx(ArrowUpRight, {
							className: "h-4 w-4",
							strokeWidth: 1.5
						})]
					})
				]
			}),
			!isLoading && items.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				children: items.map((item) => /* @__PURE__ */ jsx(FavoriteCard, {
					item,
					isFavorite: isFavorite(item.id),
					onToggle: () => toggle(item.id)
				}, item.id))
			})
		]
	});
}
function FavoriteCard({ item, isFavorite, onToggle }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "group relative",
		children: [/* @__PURE__ */ jsx(Link, {
			to: "/listing/$slug",
			params: { slug: item.slug },
			className: "block overflow-hidden bg-(--surface-2)",
			children: /* @__PURE__ */ jsxs("div", {
				className: "relative aspect-[4/3] overflow-hidden",
				children: [item.coverUrl ? /* @__PURE__ */ jsx("img", {
					src: item.coverUrl,
					alt: item.title,
					className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
					loading: "lazy"
				}) : /* @__PURE__ */ jsx("div", { className: "h-full w-full bg-(--surface-3)" }), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: (e) => {
						e.preventDefault();
						e.stopPropagation();
						onToggle();
					},
					"aria-label": isFavorite ? "Remove from favorites" : "Save to favorites",
					className: "absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-background/80 backdrop-blur-sm transition-colors hover:bg-background",
					children: /* @__PURE__ */ jsx(Heart, {
						className: "h-4 w-4 transition-colors",
						strokeWidth: 1.5,
						style: {
							fill: isFavorite ? "var(--red)" : "transparent",
							stroke: isFavorite ? "var(--red)" : "var(--ink-2)"
						}
					})
				})]
			})
		}), /* @__PURE__ */ jsxs(Link, {
			to: "/listing/$slug",
			params: { slug: item.slug },
			className: "mt-4 block",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "meta-label",
					style: { color: "var(--ink-3)" },
					children: [
						item.category,
						" · ",
						item.city
					]
				}),
				/* @__PURE__ */ jsx("h3", {
					className: "mt-1.5 font-display text-xl font-medium leading-tight tracking-[-0.01em] line-clamp-2 text-foreground",
					children: item.title
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm tabular-nums",
					style: { color: "var(--ink-2)" },
					children: new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: item.currency,
						maximumFractionDigits: 0
					}).format(item.price)
				})
			]
		})]
	});
}
//#endregion
export { FavoritesPage as component };
