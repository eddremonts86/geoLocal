import { i as getRecentListingsFn, n as getAdminDashboardFn, r as getListingsTrendFn } from "./admin-stats.fn-CfAoDK_g.js";
import { t as Skeleton } from "./skeleton-CRJxhCYm.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Car, CheckCircle2, FileText, Home, Inbox, Minus, Sparkles, Wrench, XCircle } from "lucide-react";
//#region src/modules/admin/ui/DashboardPage.tsx
var CATEGORY_META = {
	property: {
		label: "Properties",
		icon: Home,
		color: "var(--cat-property)"
	},
	vehicle: {
		label: "Vehicles",
		icon: Car,
		color: "var(--cat-vehicle)"
	},
	service: {
		label: "Services",
		icon: Wrench,
		color: "var(--cat-service)"
	},
	experience: {
		label: "Experiences",
		icon: Sparkles,
		color: "var(--cat-experience)"
	}
};
var SOURCE_LABELS = {
	airbnb: "Airbnb",
	facebook: "Facebook",
	"facebook-events": "FB Events",
	linkedin: "LinkedIn",
	edc: "EDC",
	homestra: "Homestra",
	boligsiden: "Boligsiden",
	boliga: "Boliga"
};
function formatPct(delta) {
	if (!Number.isFinite(delta)) return "—";
	return `${delta > 0 ? "+" : ""}${Math.round(delta * 100)}%`;
}
function DashboardPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "dashboard"],
		queryFn: () => getAdminDashboardFn()
	});
	const { data: recent, isLoading: recentLoading } = useQuery({
		queryKey: ["admin", "recent"],
		queryFn: () => getRecentListingsFn()
	});
	const { data: trend } = useQuery({
		queryKey: ["admin", "trend"],
		queryFn: () => getListingsTrendFn()
	});
	const hero = data?.hero;
	const pipeline = data?.pipeline;
	const topSources = data?.topSources ?? [];
	const thisM = hero?.publishedThisMonth ?? 0;
	const lastM = hero?.publishedLastMonth ?? 0;
	const prevM = hero?.publishedPrevMonth ?? 0;
	const deltaMoM = lastM === 0 ? thisM > 0 ? 1 : 0 : (thisM - lastM) / lastM;
	const deltaLast = prevM === 0 ? lastM > 0 ? 1 : 0 : (lastM - prevM) / prevM;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-14",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "meta-label",
						style: { color: "var(--ink-3)" },
						children: "01 · Editor's desk"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "font-display text-[clamp(2.5rem,1.8rem+2.4vw,4rem)] font-medium leading-[0.95] tracking-tight text-foreground",
						children: "Good day. Here's what's happening."
					}),
					/* @__PURE__ */ jsx("p", {
						className: "max-w-2xl text-lg leading-relaxed",
						style: { color: "var(--ink-2)" },
						children: "A daily read on your catalog, pipeline, and the little stories behind the numbers."
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "grid grid-cols-1 gap-px bg-(--line-1) md:grid-cols-3",
				children: [
					/* @__PURE__ */ jsx(HeroNumber, {
						label: "Total catalog",
						value: hero?.total,
						sub: `${hero?.published ?? 0} published · ${hero?.drafts ?? 0} drafts`,
						loading: isLoading
					}),
					/* @__PURE__ */ jsx(HeroNumber, {
						label: "Published this month",
						value: thisM,
						sub: `${lastM} last month`,
						delta: deltaMoM,
						loading: isLoading
					}),
					/* @__PURE__ */ jsx(HeroNumber, {
						label: "Published last month",
						value: lastM,
						sub: `${prevM} the month before`,
						delta: deltaLast,
						loading: isLoading
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "meta-label",
					style: { color: "var(--ink-3)" },
					children: "02 · By category"
				}), /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-2 gap-px bg-(--line-1) lg:grid-cols-4",
					children: [
						"property",
						"vehicle",
						"service",
						"experience"
					].map((cat) => {
						const meta = CATEGORY_META[cat];
						const stat = data?.byCategory?.[cat] ?? {
							total: 0,
							published: 0
						};
						const pct = stat.total > 0 ? stat.published / stat.total : 0;
						return /* @__PURE__ */ jsxs(Link, {
							to: "/admin/listings",
							search: { category: cat },
							className: "group relative block bg-background p-6 transition-colors hover:bg-(--surface-2)",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "mb-4 flex items-center justify-between",
									children: [/* @__PURE__ */ jsx("span", {
										className: "meta-label",
										style: { color: meta.color },
										children: meta.label
									}), /* @__PURE__ */ jsx(meta.icon, {
										className: "h-4 w-4",
										style: { color: meta.color },
										strokeWidth: 1.5
									})]
								}),
								isLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-24" }) : /* @__PURE__ */ jsx("div", {
									className: "font-display text-4xl font-medium tabular-nums tracking-tight text-foreground",
									children: stat.total.toLocaleString()
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-4 space-y-1.5",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-baseline justify-between text-xs",
										children: [/* @__PURE__ */ jsx("span", {
											style: { color: "var(--ink-3)" },
											children: "Published"
										}), /* @__PURE__ */ jsxs("span", {
											className: "tabular-nums",
											style: { color: "var(--ink-2)" },
											children: [
												stat.published,
												" (",
												Math.round(pct * 100),
												"%)"
											]
										})]
									}), /* @__PURE__ */ jsx("div", {
										className: "h-0.5 w-full bg-(--line-1)",
										children: /* @__PURE__ */ jsx("div", {
											className: "h-full transition-all",
											style: {
												width: `${pct * 100}%`,
												backgroundColor: meta.color
											}
										})
									})]
								}),
								/* @__PURE__ */ jsx(ArrowUpRight, {
									className: "absolute right-6 bottom-6 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100",
									style: { color: "var(--ink-3)" },
									strokeWidth: 1.5
								})
							]
						}, cat);
					})
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "grid grid-cols-1 gap-px bg-(--line-1) lg:grid-cols-[1.2fr_1fr]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "bg-background p-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "mb-4 flex items-baseline justify-between",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "meta-label",
							style: { color: "var(--ink-3)" },
							children: "02b · Catalog mix"
						}), /* @__PURE__ */ jsxs("span", {
							className: "meta-label tabular-nums",
							style: { color: "var(--ink-4)" },
							children: [(hero?.total ?? 0).toLocaleString(), " total"]
						})]
					}), /* @__PURE__ */ jsx(DonutCategories, { data: [
						"property",
						"vehicle",
						"service",
						"experience"
					].map((cat) => ({
						key: cat,
						label: CATEGORY_META[cat].label,
						color: CATEGORY_META[cat].color,
						value: data?.byCategory?.[cat]?.total ?? 0
					})) })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "bg-background p-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "mb-4 flex items-baseline justify-between",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "meta-label",
							style: { color: "var(--ink-3)" },
							children: "02c · Status mix"
						}), /* @__PURE__ */ jsxs("span", {
							className: "meta-label tabular-nums",
							style: { color: "var(--ink-4)" },
							children: [(hero?.total ?? 0).toLocaleString(), " listings"]
						})]
					}), /* @__PURE__ */ jsx(StackedBarStatus, {
						published: hero?.published ?? 0,
						drafts: hero?.drafts ?? 0,
						archived: hero?.archived ?? 0
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "meta-label",
							style: { color: "var(--ink-3)" },
							children: "03 · Scraping pipeline"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-4 gap-px border border-(--line-1) bg-(--line-1)",
							children: [
								/* @__PURE__ */ jsx(PipelineCell, {
									icon: Inbox,
									label: "Pending",
									value: pipeline?.pendingReview,
									to: "/admin/scraping",
									accent: "var(--amber-ink)",
									loading: isLoading
								}),
								/* @__PURE__ */ jsx(PipelineCell, {
									icon: FileText,
									label: "Reviewed",
									value: pipeline?.reviewed,
									accent: "var(--ink-3)",
									loading: isLoading
								}),
								/* @__PURE__ */ jsx(PipelineCell, {
									icon: CheckCircle2,
									label: "Published",
									value: pipeline?.published,
									accent: "var(--cat-vehicle)",
									loading: isLoading
								}),
								/* @__PURE__ */ jsx(PipelineCell, {
									icon: XCircle,
									label: "Rejected",
									value: pipeline?.rejected,
									accent: "var(--ink-4)",
									loading: isLoading
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "border border-(--line-1) bg-background p-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "mb-4 flex items-baseline justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "meta-label",
									style: { color: "var(--ink-3)" },
									children: "Pending by source"
								}), /* @__PURE__ */ jsx(Link, {
									to: "/admin/scraping",
									className: "meta-label text-(--ink-3) hover:text-foreground",
									children: "View all →"
								})]
							}), topSources.length === 0 ? /* @__PURE__ */ jsx("div", {
								className: "py-6 text-center text-sm text-(--ink-3)",
								children: "Queue is clear."
							}) : /* @__PURE__ */ jsx("ul", {
								className: "space-y-2.5",
								children: topSources.map((s) => {
									const max = topSources[0]?.count ?? 1;
									return /* @__PURE__ */ jsxs("li", {
										className: "grid grid-cols-[120px_1fr_auto] items-center gap-3 text-sm",
										children: [
											/* @__PURE__ */ jsx("span", {
												style: { color: "var(--ink-2)" },
												children: SOURCE_LABELS[s.source] ?? s.source
											}),
											/* @__PURE__ */ jsx("div", {
												className: "h-1.5 bg-(--surface-2)",
												children: /* @__PURE__ */ jsx("div", {
													className: "h-full bg-foreground",
													style: { width: `${s.count / max * 100}%` }
												})
											}),
											/* @__PURE__ */ jsx("span", {
												className: "w-10 text-right tabular-nums",
												style: { color: "var(--ink-2)" },
												children: s.count
											})
										]
									}, s.source);
								})
							})]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "meta-label",
						style: { color: "var(--ink-3)" },
						children: "04 · Needs attention"
					}), /* @__PURE__ */ jsxs("div", {
						className: "divide-y divide-(--line-1) border border-(--line-1) bg-background",
						children: [
							/* @__PURE__ */ jsx(AttentionRow, {
								label: "Review queue",
								count: pipeline?.pendingReview ?? 0,
								to: "/admin/scraping",
								hint: "Scraped items waiting approval",
								loading: isLoading
							}),
							/* @__PURE__ */ jsx(AttentionRow, {
								label: "Unpublished drafts",
								count: hero?.drafts ?? 0,
								to: "/admin/listings",
								toSearch: { status: "draft" },
								hint: "Created but not live",
								loading: isLoading
							}),
							/* @__PURE__ */ jsx(AttentionRow, {
								label: "New source candidates",
								count: data?.pendingSources ?? 0,
								to: "/admin/scraping/sources",
								hint: "Domains discovered by crawler",
								loading: isLoading
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "meta-label",
						style: { color: "var(--ink-3)" },
						children: "06 · Publish trend · last 12 weeks"
					}), /* @__PURE__ */ jsxs("span", {
						className: "meta-label tabular-nums",
						style: { color: "var(--ink-4)" },
						children: [(trend?.reduce((a, b) => a + b.total, 0) ?? 0).toLocaleString(), " published"]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 gap-px bg-(--line-1) lg:grid-cols-[1fr_1.4fr]",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "bg-background p-6",
						children: [/* @__PURE__ */ jsx("div", {
							className: "meta-label mb-3",
							style: { color: "var(--ink-4)" },
							children: "Weekly total"
						}), /* @__PURE__ */ jsx(SparklineArea, { data: (trend ?? []).map((b) => b.total) })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "bg-background p-6",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ jsx("span", {
								className: "meta-label",
								style: { color: "var(--ink-4)" },
								children: "By category"
							}), /* @__PURE__ */ jsx("div", {
								className: "flex flex-wrap items-center gap-3 text-xs",
								children: [
									"property",
									"vehicle",
									"service",
									"experience"
								].map((cat) => /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1.5",
									style: { color: "var(--ink-3)" },
									children: [/* @__PURE__ */ jsx("span", {
										className: "h-2 w-2",
										style: { backgroundColor: CATEGORY_META[cat].color }
									}), CATEGORY_META[cat].label]
								}, cat))
							})]
						}), /* @__PURE__ */ jsx(StackedAreaByCategory, { data: trend ?? [] })]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "meta-label",
						style: { color: "var(--ink-3)" },
						children: "07 · Recent activity"
					}), /* @__PURE__ */ jsx(Link, {
						to: "/admin/listings",
						className: "meta-label text-(--ink-3) hover:text-foreground",
						children: "View all →"
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "border border-(--line-1) bg-background",
					children: recentLoading ? /* @__PURE__ */ jsx("div", {
						className: "divide-y divide-(--line-1)",
						children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx("div", {
							className: "p-4",
							children: /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-2/3" })
						}, i))
					}) : recent && recent.length > 0 ? /* @__PURE__ */ jsx("ul", {
						className: "divide-y divide-(--line-1)",
						children: recent.map((item) => {
							const meta = CATEGORY_META[item.category];
							const Icon = meta?.icon ?? FileText;
							return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
								to: "/admin/listings/$id",
								params: { id: item.id },
								className: "grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-(--surface-2)",
								children: [
									/* @__PURE__ */ jsx(Icon, {
										className: "h-4 w-4",
										style: { color: meta?.color ?? "var(--ink-3)" },
										strokeWidth: 1.5
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ jsx("div", {
											className: "truncate text-sm text-foreground",
											children: item.title
										}), /* @__PURE__ */ jsxs("div", {
											className: "meta-label truncate",
											style: { color: "var(--ink-3)" },
											children: [
												item.city,
												" · ",
												item.subCategory
											]
										})]
									}),
									/* @__PURE__ */ jsx(StatusPill, { status: item.status }),
									/* @__PURE__ */ jsx("span", {
										className: "hidden text-xs tabular-nums text-(--ink-3) md:block",
										children: new Date(item.createdAt).toLocaleDateString()
									}),
									/* @__PURE__ */ jsx(ArrowUpRight, {
										className: "h-3.5 w-3.5 text-(--ink-4)",
										strokeWidth: 1.5
									})
								]
							}) }, item.id);
						})
					}) : /* @__PURE__ */ jsx("div", {
						className: "p-10 text-center text-sm text-(--ink-3)",
						children: "No activity yet."
					})
				})]
			})
		]
	});
}
function HeroNumber({ label, value, sub, delta, loading }) {
	const deltaIcon = delta == null ? null : delta > 0 ? /* @__PURE__ */ jsx(ArrowUpRight, {
		className: "h-3.5 w-3.5",
		strokeWidth: 2
	}) : delta < 0 ? /* @__PURE__ */ jsx(ArrowDownRight, {
		className: "h-3.5 w-3.5",
		strokeWidth: 2
	}) : /* @__PURE__ */ jsx(Minus, {
		className: "h-3.5 w-3.5",
		strokeWidth: 2
	});
	const deltaColor = delta == null ? "var(--ink-3)" : delta > 0 ? "var(--cat-vehicle)" : delta < 0 ? "var(--red)" : "var(--ink-3)";
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-background p-8",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "meta-label mb-3",
				style: { color: "var(--ink-3)" },
				children: label
			}),
			loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-14 w-32" }) : /* @__PURE__ */ jsx("div", {
				className: "font-display text-5xl font-medium leading-none tracking-tight tabular-nums text-foreground md:text-6xl",
				children: (value ?? 0).toLocaleString()
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 flex items-center gap-2 text-xs",
				children: [delta != null && /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-0.5 font-medium tabular-nums",
					style: { color: deltaColor },
					children: [deltaIcon, formatPct(delta)]
				}), sub && /* @__PURE__ */ jsx("span", {
					style: { color: "var(--ink-3)" },
					children: sub
				})]
			})
		]
	});
}
function PipelineCell({ icon: Icon, label, value, accent, to, loading }) {
	const body = /* @__PURE__ */ jsxs("div", {
		className: "bg-background p-5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ jsx("span", {
				className: "meta-label",
				style: { color: "var(--ink-3)" },
				children: label
			}), /* @__PURE__ */ jsx(Icon, {
				className: "h-3.5 w-3.5",
				style: { color: accent },
				strokeWidth: 1.5
			})]
		}), loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-9 w-16" }) : /* @__PURE__ */ jsx("div", {
			className: "font-display text-3xl font-medium tabular-nums text-foreground",
			children: (value ?? 0).toLocaleString()
		})]
	});
	if (to) return /* @__PURE__ */ jsx(Link, {
		to,
		className: "block transition-colors hover:bg-(--surface-2)",
		children: body
	});
	return body;
}
function AttentionRow({ label, count, to, toSearch, hint, loading }) {
	return /* @__PURE__ */ jsxs(Link, {
		to,
		search: toSearch,
		className: "flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-(--surface-2)",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-sm text-foreground",
				children: label
			}), /* @__PURE__ */ jsx("div", {
				className: "meta-label mt-0.5",
				style: { color: "var(--ink-4)" },
				children: hint
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3",
			children: [
				count > 0 ? /* @__PURE__ */ jsx(AlertTriangle, {
					className: "h-3.5 w-3.5",
					style: { color: "var(--amber-ink)" },
					strokeWidth: 1.5
				}) : /* @__PURE__ */ jsx(CheckCircle2, {
					className: "h-3.5 w-3.5",
					style: { color: "var(--cat-vehicle)" },
					strokeWidth: 1.5
				}),
				loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-8" }) : /* @__PURE__ */ jsx("span", {
					className: "font-display text-xl font-medium tabular-nums text-foreground",
					children: count
				}),
				/* @__PURE__ */ jsx(ArrowUpRight, {
					className: "h-3.5 w-3.5 text-(--ink-4)",
					strokeWidth: 1.5
				})
			]
		})]
	});
}
function StatusPill({ status }) {
	const MAP = {
		published: {
			label: "Published",
			color: "var(--cat-vehicle)",
			bg: "color-mix(in oklch, var(--cat-vehicle) 12%, transparent)"
		},
		draft: {
			label: "Draft",
			color: "var(--amber-ink)",
			bg: "color-mix(in oklch, var(--amber) 20%, transparent)"
		},
		archived: {
			label: "Archived",
			color: "var(--ink-3)",
			bg: "var(--surface-2)"
		}
	};
	const m = MAP[status] ?? MAP.draft;
	return /* @__PURE__ */ jsx("span", {
		className: "meta-label inline-flex h-6 items-center px-2 tabular-nums",
		style: {
			color: m.color,
			backgroundColor: m.bg
		},
		children: m.label
	});
}
function SparklineArea({ data }) {
	const W = 320;
	const H = 88;
	const pad = 2;
	const n = data.length;
	if (n === 0) return /* @__PURE__ */ jsx("div", {
		className: "flex h-22 items-center justify-center text-xs text-(--ink-4)",
		children: "No data"
	});
	const max = Math.max(1, ...data);
	const stepX = (W - pad * 2) / Math.max(1, n - 1);
	const pts = data.map((v, i) => {
		return [pad + i * stepX, H - pad - v / max * (H - pad * 2)];
	});
	const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
	const area = `${line} L${(W - pad).toFixed(1)},${(H - pad).toFixed(1)} L${pad},${(H - pad).toFixed(1)} Z`;
	const last = pts[pts.length - 1];
	const avg = data.reduce((a, b) => a + b, 0) / n;
	const avgY = H - pad - avg / max * (H - pad * 2);
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("svg", {
		viewBox: `0 0 ${W} ${H}`,
		className: "block h-22 w-full",
		preserveAspectRatio: "none",
		children: [
			/* @__PURE__ */ jsx("path", {
				d: area,
				fill: "var(--ink-4)",
				opacity: "0.14"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: pad,
				x2: W - pad,
				y1: avgY,
				y2: avgY,
				stroke: "var(--ink-4)",
				strokeWidth: .5,
				strokeDasharray: "2 3"
			}),
			/* @__PURE__ */ jsx("path", {
				d: line,
				fill: "none",
				stroke: "var(--ink-1)",
				strokeWidth: 1.5
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: last[0],
				cy: last[1],
				r: 2.5,
				fill: "var(--ink-1)"
			})
		]
	}), /* @__PURE__ */ jsxs("div", {
		className: "mt-3 flex items-baseline justify-between text-xs",
		children: [/* @__PURE__ */ jsx("div", {
			className: "font-display text-2xl tabular-nums text-foreground",
			children: data[n - 1]?.toLocaleString() ?? 0
		}), /* @__PURE__ */ jsxs("div", {
			className: "meta-label tabular-nums",
			style: { color: "var(--ink-4)" },
			children: [
				"avg ",
				Math.round(avg).toLocaleString(),
				"/wk"
			]
		})]
	})] });
}
function StackedAreaByCategory({ data }) {
	const W = 520;
	const H = 160;
	const pad = 4;
	const cats = [
		"experience",
		"service",
		"vehicle",
		"property"
	];
	const colors = {
		property: "var(--cat-property)",
		vehicle: "var(--cat-vehicle)",
		service: "var(--cat-service)",
		experience: "var(--cat-experience)"
	};
	if (!data.length) return /* @__PURE__ */ jsx("div", {
		className: "flex h-40 items-center justify-center text-xs text-(--ink-4)",
		children: "No data"
	});
	const max = Math.max(1, ...data.map((d) => d.total));
	const stepX = (W - pad * 2) / Math.max(1, data.length - 1);
	const baselines = data.map(() => [0]);
	for (const cat of cats) data.forEach((d, i) => {
		const prev = baselines[i][baselines[i].length - 1];
		baselines[i].push(prev + (d[cat] ?? 0));
	});
	const paths = cats.map((cat, catIdx) => {
		const upper = data.map((_, i) => {
			const y = baselines[i][catIdx + 1];
			return [pad + i * stepX, H - pad - y / max * (H - pad * 2)];
		});
		const lower = data.map((_, i) => {
			const y = baselines[i][catIdx];
			return [pad + i * stepX, H - pad - y / max * (H - pad * 2)];
		});
		return {
			cat,
			d: upper.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " " + lower.slice().reverse().map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " Z"
		};
	});
	const labelIdx = [
		0,
		Math.floor(data.length / 2),
		data.length - 1
	];
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("svg", {
		viewBox: `0 0 ${W} ${H}`,
		className: "block h-40 w-full",
		preserveAspectRatio: "none",
		children: [paths.map(({ cat, d }) => /* @__PURE__ */ jsx("path", {
			d,
			fill: colors[cat],
			opacity: .85
		}, cat)), /* @__PURE__ */ jsx("line", {
			x1: pad,
			x2: W - pad,
			y1: H - pad,
			y2: H - pad,
			stroke: "var(--line-1)",
			strokeWidth: .5
		})]
	}), /* @__PURE__ */ jsx("div", {
		className: "mt-2 flex justify-between text-[10px] tabular-nums",
		style: { color: "var(--ink-4)" },
		children: labelIdx.map((i) => /* @__PURE__ */ jsx("span", { children: data[i] ? new Date(data[i].weekStart).toLocaleDateString(void 0, {
			month: "short",
			day: "numeric"
		}) : "" }, i))
	})] });
}
function DonutCategories({ data }) {
	const total = data.reduce((a, b) => a + b.value, 0);
	const size = 180;
	const cx = size / 2;
	const cy = size / 2;
	const r = 70;
	const innerR = 48;
	if (total === 0) return /* @__PURE__ */ jsx("div", {
		className: "flex h-44 items-center justify-center text-xs text-(--ink-4)",
		children: "No listings yet"
	});
	const arcs = [];
	let acc = 0;
	for (const slice of data) {
		if (slice.value <= 0) continue;
		const start = acc / total * Math.PI * 2 - Math.PI / 2;
		acc += slice.value;
		const end = acc / total * Math.PI * 2 - Math.PI / 2;
		const large = end - start > Math.PI ? 1 : 0;
		const x1 = cx + r * Math.cos(start);
		const y1 = cy + r * Math.sin(start);
		const x2 = cx + r * Math.cos(end);
		const y2 = cy + r * Math.sin(end);
		const x3 = cx + innerR * Math.cos(end);
		const y3 = cy + innerR * Math.sin(end);
		const x4 = cx + innerR * Math.cos(start);
		const y4 = cy + innerR * Math.sin(start);
		arcs.push({
			color: slice.color,
			d: `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${innerR},${innerR} 0 ${large} 0 ${x4.toFixed(2)},${y4.toFixed(2)} Z`
		});
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-6",
		children: [/* @__PURE__ */ jsxs("svg", {
			viewBox: `0 0 ${size} ${size}`,
			className: "h-44 w-44 shrink-0",
			children: [
				arcs.map((a, i) => /* @__PURE__ */ jsx("path", {
					d: a.d,
					fill: a.color
				}, i)),
				/* @__PURE__ */ jsx("text", {
					x: cx,
					y: cy - 4,
					textAnchor: "middle",
					className: "fill-foreground font-display tabular-nums",
					style: {
						fontSize: 22,
						fontWeight: 500
					},
					children: total.toLocaleString()
				}),
				/* @__PURE__ */ jsx("text", {
					x: cx,
					y: cy + 14,
					textAnchor: "middle",
					className: "fill-(--ink-4)",
					style: {
						fontSize: 9,
						letterSpacing: "0.1em",
						textTransform: "uppercase"
					},
					children: "total"
				})
			]
		}), /* @__PURE__ */ jsx("ul", {
			className: "flex-1 space-y-2 text-sm",
			children: data.map((s) => {
				const pct = total > 0 ? s.value / total * 100 : 0;
				return /* @__PURE__ */ jsxs("li", {
					className: "grid grid-cols-[10px_1fr_auto_auto] items-center gap-3",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "h-2.5 w-2.5",
							style: { backgroundColor: s.color }
						}),
						/* @__PURE__ */ jsx("span", {
							style: { color: "var(--ink-2)" },
							children: s.label
						}),
						/* @__PURE__ */ jsx("span", {
							className: "tabular-nums",
							style: { color: "var(--ink-3)" },
							children: s.value.toLocaleString()
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "w-10 text-right tabular-nums",
							style: { color: "var(--ink-4)" },
							children: [pct.toFixed(0), "%"]
						})
					]
				}, s.key);
			})
		})]
	});
}
function StackedBarStatus({ published, drafts, archived }) {
	const total = published + drafts + archived;
	const rows = [
		{
			key: "published",
			label: "Published",
			value: published,
			color: "var(--cat-vehicle)"
		},
		{
			key: "draft",
			label: "Drafts",
			value: drafts,
			color: "var(--amber-ink)"
		},
		{
			key: "archived",
			label: "Archived",
			value: archived,
			color: "var(--ink-4)"
		}
	];
	if (total === 0) return /* @__PURE__ */ jsx("div", {
		className: "flex h-44 items-center justify-center text-xs text-(--ink-4)",
		children: "Nothing here yet"
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex h-3 w-full overflow-hidden",
			children: rows.map((r) => {
				const pct = total > 0 ? r.value / total * 100 : 0;
				if (pct === 0) return null;
				return /* @__PURE__ */ jsx("div", { style: {
					width: `${pct}%`,
					backgroundColor: r.color
				} }, r.key);
			})
		}), /* @__PURE__ */ jsx("ul", {
			className: "space-y-2.5 text-sm",
			children: rows.map((r) => {
				const pct = total > 0 ? r.value / total * 100 : 0;
				return /* @__PURE__ */ jsxs("li", {
					className: "grid grid-cols-[10px_1fr_auto_auto] items-center gap-3",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "h-2.5 w-2.5",
							style: { backgroundColor: r.color }
						}),
						/* @__PURE__ */ jsx("span", {
							style: { color: "var(--ink-2)" },
							children: r.label
						}),
						/* @__PURE__ */ jsx("span", {
							className: "tabular-nums",
							style: { color: "var(--ink-3)" },
							children: r.value.toLocaleString()
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "w-10 text-right tabular-nums",
							style: { color: "var(--ink-4)" },
							children: [pct.toFixed(0), "%"]
						})
					]
				}, r.key);
			})
		})]
	});
}
//#endregion
//#region src/routes/_admin/admin/index.tsx?tsr-split=component
var SplitComponent = DashboardPage;
//#endregion
export { SplitComponent as component };
