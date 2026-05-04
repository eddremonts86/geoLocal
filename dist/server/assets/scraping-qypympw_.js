import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { t as Button } from "./button-D7roF92S.js";
import { t as Skeleton } from "./skeleton-CRJxhCYm.js";
import { t as Badge } from "./badge-C9JK8Bm8.js";
import { a as SelectValue, c as CardHeader, i as SelectTrigger, l as CardTitle, n as SelectContent, o as Card, r as SelectItem, s as CardContent, t as Select } from "./select-DDTV2LjK.js";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-B3IsuV6e.js";
import { useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "framer-motion";
import { Calendar, Check, CheckCheck, ChevronLeft, ChevronRight, Code2, ExternalLink, Eye, Home, ImageOff, Loader2, MapPin, RefreshCw, Sparkles, Tag, Wrench, X } from "lucide-react";
//#region src/modules/admin/api/scraped-items.fn.ts
var SCRAPED_SOURCES = [
	"airbnb",
	"facebook",
	"facebook-events",
	"linkedin",
	"edc",
	"homestra",
	"boligsiden",
	"boliga"
];
var listScrapedSchema = z.object({
	source: z.enum(SCRAPED_SOURCES).optional(),
	status: z.enum([
		"pending",
		"reviewed",
		"published",
		"rejected"
	]).optional(),
	page: z.number().default(1),
	pageSize: z.number().default(20)
});
var listScrapedRawFn = createServerFn({ method: "GET" }).inputValidator(listScrapedSchema).handler(createSsrRpc("3ef48072c2fa482e78b6294900999484ce1a25e39876e200b6bce700e475d59e"));
var getScrapedRawItemFn = createServerFn({ method: "GET" }).inputValidator(z.object({ id: z.string().uuid() })).handler(createSsrRpc("19f137377c5ec98e208077e930b6e9cdc088e3c0b5925ada33bab06774974351"));
var rejectScrapedItemFn = createServerFn({ method: "POST" }).inputValidator(z.object({ id: z.string().uuid() })).handler(createSsrRpc("fb5a593522eabc562557fd6647e67b62b488c9c88b8908376644e0a802ea4469"));
/** Max images we attach per listing — DB-friendly cap. */
/** Read first defined value of several possible keys from a loose record. */
var publishSchema = z.object({ id: z.string().uuid() });
var publishScrapedItemFn = createServerFn({ method: "POST" }).inputValidator(publishSchema).handler(createSsrRpc("47f12cfb5a0fb631acc96673abe852a20e87ebd9d4169b2c83d26832b1a0f55e"));
var publishAllSchema = z.object({ source: z.enum(SCRAPED_SOURCES).optional() });
var publishAllPendingFn = createServerFn({ method: "POST" }).inputValidator(publishAllSchema).handler(createSsrRpc("32b57744edbbf1c316c75c55e2d985820e52fbe55e588d5bd7b576addf7cc648"));
//#endregion
//#region src/modules/admin/ui/ScrapingReviewPage.tsx
var sourceColors = {
	airbnb: "bg-rose-500/10 text-rose-600",
	facebook: "bg-blue-500/10 text-blue-600",
	"facebook-events": "bg-purple-500/10 text-purple-600",
	linkedin: "bg-sky-500/10 text-sky-600",
	edc: "bg-amber-500/10 text-amber-700",
	homestra: "bg-teal-500/10 text-teal-700",
	boligsiden: "bg-emerald-500/10 text-emerald-700",
	boliga: "bg-indigo-500/10 text-indigo-700"
};
var sourceLabels = {
	airbnb: "Airbnb",
	facebook: "Facebook",
	"facebook-events": "FB Events",
	linkedin: "LinkedIn",
	edc: "EDC",
	homestra: "Homestra",
	boligsiden: "Boligsiden",
	boliga: "Boliga"
};
var statusColors = {
	pending: "bg-yellow-500/10 text-yellow-600",
	reviewed: "bg-blue-500/10 text-blue-600",
	published: "bg-green-500/10 text-green-600",
	rejected: "bg-gray-500/10 text-gray-500"
};
var categoryIcons = {
	property: Home,
	service: Wrench,
	experience: Sparkles
};
var categoryColors = {
	property: "text-amber-600",
	service: "text-blue-600",
	experience: "text-purple-600"
};
var stagger = {
	hidden: {},
	show: { transition: { staggerChildren: .05 } }
};
var row = {
	hidden: {
		opacity: 0,
		y: 8
	},
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: .22 }
	}
};
function formatPrice(price, currency) {
	if (price == null || price === 0) return null;
	const c = currency ?? "DKK";
	return new Intl.NumberFormat("da-DK", {
		style: "currency",
		currency: c,
		maximumFractionDigits: 0
	}).format(price);
}
function formatDate(iso) {
	if (!iso) return null;
	try {
		return new Date(iso).toLocaleDateString("da-DK", {
			day: "numeric",
			month: "short",
			year: "numeric"
		});
	} catch {
		return null;
	}
}
var PLACEHOLDER = "/img-placeholder.svg";
function ListingPreviewDialog({ item, open, onClose }) {
	if (!item) return null;
	const CatIcon = categoryIcons[item.mappedCategory ?? "service"] ?? Wrench;
	const catColor = categoryColors[item.mappedCategory ?? "service"] ?? "text-blue-600";
	const priceStr = formatPrice(item.price, item.currency);
	const dateStr = formatDate(item.startDate);
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange: (v) => !v && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-sm overflow-hidden p-0",
			children: [
				/* @__PURE__ */ jsx(DialogHeader, {
					className: "sr-only",
					children: /* @__PURE__ */ jsx(DialogTitle, { children: "Listing preview" })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative h-52 w-full bg-surface overflow-hidden",
					children: [
						item.imageUrl ? /* @__PURE__ */ jsx("img", {
							src: item.imageUrl,
							alt: "",
							className: "h-full w-full object-cover",
							onError: (e) => {
								e.currentTarget.src = PLACEHOLDER;
								e.currentTarget.onerror = null;
							}
						}) : /* @__PURE__ */ jsx("div", {
							className: "flex h-full w-full items-center justify-center bg-surface-2",
							children: /* @__PURE__ */ jsx(ImageOff, { className: "h-10 w-10 text-muted/40" })
						}),
						/* @__PURE__ */ jsxs("span", {
							className: `absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold shadow-sm ${catColor}`,
							children: [/* @__PURE__ */ jsx(CatIcon, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", {
								className: "capitalize",
								children: item.mappedCategory ?? "listing"
							})]
						}),
						priceStr && /* @__PURE__ */ jsx("span", {
							className: "absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-foreground shadow",
							children: priceStr
						}),
						/* @__PURE__ */ jsx("span", {
							className: `absolute right-3 top-3 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${sourceColors[item.source]}`,
							children: sourceLabels[item.source]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "px-5 pb-5 pt-4 space-y-3",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-lg font-semibold leading-snug text-foreground",
							children: item.title ?? item.sourceId
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted",
							children: [
								item.city && /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }), item.city]
								}),
								dateStr && /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }), dateStr]
								}),
								!item.city && !dateStr && /* @__PURE__ */ jsx("span", {
									className: "italic",
									children: "No location data"
								})
							]
						})] }),
						item.description && /* @__PURE__ */ jsx("p", {
							className: "text-sm text-foreground/70 leading-relaxed line-clamp-4",
							children: item.description
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 pt-1",
							children: [/* @__PURE__ */ jsx(Badge, {
								className: `text-xs ${statusColors[item.status]}`,
								children: item.status
							}), priceStr && /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1 text-xs text-muted",
								children: [/* @__PURE__ */ jsx(Tag, { className: "h-3 w-3" }), priceStr]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs(DialogFooter, {
					className: "border-t border-border px-5 py-3 flex gap-2",
					children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						size: "sm",
						className: "flex-1",
						onClick: onClose,
						children: "Close"
					}), /* @__PURE__ */ jsx(Button, {
						variant: "outline",
						size: "sm",
						className: "flex-1",
						asChild: true,
						children: /* @__PURE__ */ jsxs("a", {
							href: item.sourceUrl,
							target: "_blank",
							rel: "noopener noreferrer",
							children: [/* @__PURE__ */ jsx(ExternalLink, { className: "mr-1.5 h-3.5 w-3.5" }), "Source"]
						})
					})]
				})
			]
		})
	});
}
function RawDataDialog({ id, open, onClose }) {
	const { data, isLoading } = useQuery({
		queryKey: [
			"admin",
			"scraped",
			"raw",
			id
		],
		queryFn: () => getScrapedRawItemFn({ data: { id } }),
		enabled: open && !!id
	});
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange: (v) => !v && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-2xl max-h-[80vh] overflow-hidden flex flex-col",
			children: [
				/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, {
					className: "font-display text-lg",
					children: "Raw scraped data"
				}) }),
				/* @__PURE__ */ jsx("div", {
					className: "flex-1 overflow-y-auto rounded border border-border bg-surface p-4 text-xs font-mono",
					children: isLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-40 w-full" }) : data ? /* @__PURE__ */ jsx("pre", {
						className: "whitespace-pre-wrap break-all text-foreground/80",
						children: typeof data.rawData === "string" ? data.rawData : JSON.stringify(data.rawData, null, 2)
					}) : /* @__PURE__ */ jsx("p", {
						className: "text-muted",
						children: "Not found"
					})
				}),
				/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
					variant: "outline",
					size: "sm",
					onClick: onClose,
					children: "Close"
				}), data && /* @__PURE__ */ jsx(Button, {
					variant: "outline",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ jsxs("a", {
						href: String(data.sourceUrl ?? ""),
						target: "_blank",
						rel: "noopener noreferrer",
						children: [/* @__PURE__ */ jsx(ExternalLink, { className: "mr-1.5 h-3.5 w-3.5" }), "Open source"]
					})
				})] })
			]
		})
	});
}
function ScrapingReviewPage() {
	const queryClient = useQueryClient();
	const [sourceFilter, setSourceFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("pending");
	const [page, setPage] = useState(1);
	const pageSize = 20;
	const [previewItem, setPreviewItem] = useState(null);
	const [rawId, setRawId] = useState(null);
	const [publishAllConfirm, setPublishAllConfirm] = useState(false);
	const { data, isLoading, refetch } = useQuery({
		queryKey: [
			"admin",
			"scraped",
			{
				sourceFilter,
				statusFilter,
				page
			}
		],
		queryFn: () => listScrapedRawFn({ data: {
			source: sourceFilter !== "all" ? sourceFilter : void 0,
			status: statusFilter !== "all" ? statusFilter : void 0,
			page,
			pageSize
		} })
	});
	const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "scraped"] });
	const publishMutation = useMutation({
		mutationFn: (id) => publishScrapedItemFn({ data: { id } }),
		onSuccess: invalidate
	});
	const rejectMutation = useMutation({
		mutationFn: (id) => rejectScrapedItemFn({ data: { id } }),
		onSuccess: invalidate
	});
	const publishAllMutation = useMutation({
		mutationFn: () => publishAllPendingFn({ data: { source: sourceFilter !== "all" ? sourceFilter : void 0 } }),
		onSuccess: (result) => {
			invalidate();
			setPublishAllConfirm(false);
		}
	});
	const items = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-10",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex flex-wrap items-end justify-between gap-6 border-b border-(--line-1) pb-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "meta-label",
							style: { color: "var(--ink-3)" },
							children: "03 · Pipeline · Review queue"
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "font-display text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] font-medium leading-none tracking-tight text-foreground",
							children: "Scraped items"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "max-w-2xl text-sm leading-relaxed",
							style: { color: "var(--ink-2)" },
							children: ["Review items collected from Airbnb, Facebook, LinkedIn and more before publishing.", /* @__PURE__ */ jsxs("span", {
								className: "ml-2 tabular-nums",
								style: { color: "var(--ink-3)" },
								children: [
									"· ",
									total.toLocaleString(),
									" ",
									statusFilter === "all" ? "items" : statusFilter
								]
							})]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ jsxs(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => refetch(),
						className: "rounded-none border-(--line-1)",
						children: [/* @__PURE__ */ jsx(RefreshCw, {
							className: "mr-1.5 h-3.5 w-3.5",
							strokeWidth: 1.5
						}), "Refresh"]
					}), /* @__PURE__ */ jsxs(Button, {
						size: "sm",
						onClick: () => setPublishAllConfirm(true),
						disabled: total === 0 || statusFilter === "published" || statusFilter === "rejected",
						className: "rounded-none bg-foreground text-background hover:opacity-90",
						children: [
							/* @__PURE__ */ jsx(CheckCheck, {
								className: "mr-1.5 h-3.5 w-3.5",
								strokeWidth: 1.5
							}),
							"Publish all (",
							total,
							")"
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, {
				className: "pt-4 pb-4 flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ jsxs(Select, {
						value: sourceFilter,
						onValueChange: (v) => {
							setSourceFilter(v);
							setPage(1);
						},
						children: [/* @__PURE__ */ jsx(SelectTrigger, {
							className: "w-40",
							children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Source" })
						}), /* @__PURE__ */ jsxs(SelectContent, { children: [
							/* @__PURE__ */ jsx(SelectItem, {
								value: "all",
								children: "All sources"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "airbnb",
								children: "Airbnb"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "facebook",
								children: "Facebook"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "facebook-events",
								children: "FB Events"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "linkedin",
								children: "LinkedIn"
							})
						] })]
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: statusFilter,
						onValueChange: (v) => {
							setStatusFilter(v);
							setPage(1);
						},
						children: [/* @__PURE__ */ jsx(SelectTrigger, {
							className: "w-36",
							children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Status" })
						}), /* @__PURE__ */ jsxs(SelectContent, { children: [
							/* @__PURE__ */ jsx(SelectItem, {
								value: "all",
								children: "All statuses"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "pending",
								children: "Pending"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "reviewed",
								children: "Reviewed"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "published",
								children: "Published"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "rejected",
								children: "Rejected"
							})
						] })]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "ml-auto text-sm text-muted self-center",
						children: [total, " total items"]
					})
				]
			}) }),
			/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, {
				className: "pb-2",
				children: /* @__PURE__ */ jsx(CardTitle, {
					className: "text-base font-medium",
					children: "Scraped items"
				})
			}), /* @__PURE__ */ jsx(CardContent, {
				className: "p-0",
				children: isLoading ? /* @__PURE__ */ jsx("div", {
					className: "p-4 space-y-4",
					children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxs("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-20 rounded-md shrink-0" }), /* @__PURE__ */ jsxs("div", {
							className: "flex-1 space-y-2",
							children: [
								/* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-2/3" }),
								/* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-full" }),
								/* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/2" })
							]
						})]
					}, i))
				}) : items.length === 0 ? /* @__PURE__ */ jsx("div", {
					className: "p-8 text-center text-muted text-sm",
					children: "No items match the current filters."
				}) : /* @__PURE__ */ jsx(m.div, {
					variants: stagger,
					initial: "hidden",
					animate: "show",
					className: "divide-y divide-border",
					children: items.map((item) => {
						const CatIcon = categoryIcons[item.mappedCategory ?? "service"] ?? Wrench;
						const catColor = categoryColors[item.mappedCategory ?? "service"] ?? "text-blue-600";
						const isPending = item.status === "pending" || item.status === "reviewed";
						const isProcessing = publishMutation.isPending || rejectMutation.isPending;
						const priceStr = formatPrice(item.price, item.currency);
						const dateStr = formatDate(item.startDate);
						return /* @__PURE__ */ jsxs(m.div, {
							variants: row,
							className: "flex items-start gap-4 px-4 py-3 hover:bg-surface/60 transition-colors",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "shrink-0 h-16 w-20 rounded-md overflow-hidden bg-surface-2 border border-border/50",
									children: item.imageUrl ? /* @__PURE__ */ jsx("img", {
										src: item.imageUrl,
										alt: "",
										className: "h-full w-full object-cover",
										onError: (e) => {
											e.currentTarget.src = PLACEHOLDER;
											e.currentTarget.onerror = null;
										}
									}) : /* @__PURE__ */ jsx("div", {
										className: "flex h-full w-full items-center justify-center",
										children: /* @__PURE__ */ jsx(ImageOff, { className: "h-5 w-5 text-muted/30" })
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex-1 min-w-0",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-start gap-2 flex-wrap",
											children: [
												/* @__PURE__ */ jsx("p", {
													className: "text-sm font-semibold text-foreground leading-snug",
													children: item.title ?? item.sourceId
												}),
												/* @__PURE__ */ jsx(Badge, {
													className: `text-xs shrink-0 ${sourceColors[item.source]}`,
													children: sourceLabels[item.source]
												}),
												/* @__PURE__ */ jsx(Badge, {
													className: `text-xs shrink-0 ${statusColors[item.status]}`,
													children: item.status
												})
											]
										}),
										item.description && /* @__PURE__ */ jsx("p", {
											className: "mt-0.5 text-xs text-muted line-clamp-2 leading-relaxed",
											children: item.description
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted",
											children: [
												/* @__PURE__ */ jsxs("span", {
													className: `flex items-center gap-1 font-medium ${catColor}`,
													children: [/* @__PURE__ */ jsx(CatIcon, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", {
														className: "capitalize",
														children: item.mappedCategory ?? "—"
													})]
												}),
												item.city && /* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }), item.city]
												}),
												dateStr && /* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }), dateStr]
												}),
												priceStr && /* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1 font-medium text-foreground/70",
													children: [/* @__PURE__ */ jsx(Tag, { className: "h-3 w-3" }), priceStr]
												})
											]
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "shrink-0 flex items-center gap-1 pt-0.5",
									children: [
										/* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "icon",
											className: "h-7 w-7",
											title: "Preview as listing",
											onClick: () => setPreviewItem(item),
											children: /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "icon",
											className: "h-7 w-7 text-muted",
											title: "View raw data",
											onClick: () => setRawId(item.id),
											children: /* @__PURE__ */ jsx(Code2, { className: "h-3.5 w-3.5" })
										}),
										isPending && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "icon",
											className: "h-7 w-7 text-green-600 hover:text-green-700",
											title: "Publish as draft listing",
											disabled: isProcessing,
											onClick: () => publishMutation.mutate(item.id),
											children: /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" })
										}), /* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "icon",
											className: "h-7 w-7 text-destructive hover:text-destructive/80",
											title: "Reject",
											disabled: isProcessing,
											onClick: () => rejectMutation.mutate(item.id),
											children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
										})] })
									]
								})
							]
						}, item.id);
					})
				})
			})] }),
			totalPages > 1 && /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-center gap-2",
				children: [
					/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						size: "sm",
						disabled: page <= 1,
						onClick: () => setPage((p) => p - 1),
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "text-sm text-muted",
						children: [
							page,
							" / ",
							totalPages
						]
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						size: "sm",
						disabled: page >= totalPages,
						onClick: () => setPage((p) => p + 1),
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
					})
				]
			}),
			/* @__PURE__ */ jsx(ListingPreviewDialog, {
				item: previewItem,
				open: !!previewItem,
				onClose: () => setPreviewItem(null)
			}),
			/* @__PURE__ */ jsx(RawDataDialog, {
				id: rawId,
				open: !!rawId,
				onClose: () => setRawId(null)
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: publishAllConfirm,
				onOpenChange: (v) => !v && setPublishAllConfirm(false),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "max-w-sm",
					children: [
						/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, {
							className: "font-display text-lg flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(CheckCheck, { className: "h-5 w-5 text-green-600" }), "Publish All Pending"]
						}) }),
						/* @__PURE__ */ jsxs("p", {
							className: "text-sm text-muted leading-relaxed",
							children: [
								"This will publish ",
								/* @__PURE__ */ jsxs("strong", {
									className: "text-foreground",
									children: [total, " items"]
								}),
								sourceFilter !== "all" && /* @__PURE__ */ jsxs(Fragment, { children: [" from ", /* @__PURE__ */ jsx("strong", {
									className: "text-foreground",
									children: sourceFilter
								})] }),
								" ",
								"directly to the explore page. This cannot be undone in bulk."
							]
						}),
						publishAllMutation.data && /* @__PURE__ */ jsxs("p", {
							className: "text-sm text-green-600 font-medium",
							children: [
								"✓ Published ",
								publishAllMutation.data.published,
								" items",
								publishAllMutation.data.skipped > 0 && ` · ${publishAllMutation.data.skipped} errors`
							]
						}),
						/* @__PURE__ */ jsxs(DialogFooter, {
							className: "gap-2",
							children: [/* @__PURE__ */ jsx(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setPublishAllConfirm(false),
								disabled: publishAllMutation.isPending,
								children: "Cancel"
							}), /* @__PURE__ */ jsx(Button, {
								size: "sm",
								className: "bg-green-600 hover:bg-green-700 text-white",
								disabled: publishAllMutation.isPending,
								onClick: () => publishAllMutation.mutate(),
								children: publishAllMutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }), "Publishing..."] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(CheckCheck, { className: "mr-1.5 h-3.5 w-3.5" }), "Confirm Publish All"] })
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/routes/_admin/admin/scraping/index.tsx?tsr-split=component
var SplitComponent = ScrapingReviewPage;
//#endregion
export { SplitComponent as component };
