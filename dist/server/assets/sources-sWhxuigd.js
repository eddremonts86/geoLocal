import { t as createServerFn } from "../server.js";
import { t as cn } from "./utils-C17k1q7P.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { t as Skeleton } from "./skeleton-CRJxhCYm.js";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, ExternalLink, Globe, Loader2, Search, ShieldCheck, Skull, XCircle } from "lucide-react";
//#region src/modules/admin/api/scraping-sources.fn.ts
/**
* Server fns for the source-discovery admin page.
* Candidates are populated by scripts/scraping/discovery.ts.
*/
var statusSchema = z.enum([
	"pending",
	"approved",
	"rejected",
	"dead"
]);
var listSourceCandidatesFn = createServerFn({ method: "GET" }).inputValidator(z.object({ status: statusSchema.optional() })).handler(createSsrRpc("700b5f2d38895b2fed3ef9912674e8ce57189ca5b5d273a6795ec3d404d98235"));
var updateSourceCandidateStatusFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	id: z.string().uuid(),
	status: statusSchema
})).handler(createSsrRpc("477c55fcb7b9e28b013ddd664b7aa81722509f9ded35beb607ec5bf092bb525c"));
/**
* Active sources = every row in `scraping_sources`, enriched with live
* ingestion stats from `scraped_raw`. The registry table is the single source
* of truth: approving a candidate inserts a row here with kind='none';
* shipping a scraper just flips kind='built-in'. No schema change required.
*/
var listBuiltInSourcesFn = createServerFn({ method: "GET" }).handler(createSsrRpc("903d421bd77322f07210e4130186d3741cdb66011e1a51d1151ea6f3316c83f3"));
//#endregion
//#region src/modules/admin/ui/ScrapingSourcesPage.tsx
var STATUS_META = {
	pending: {
		label: "Pending",
		color: "var(--amber-ink)",
		bg: "color-mix(in oklch, var(--amber) 20%, transparent)"
	},
	approved: {
		label: "Approved",
		color: "var(--cat-vehicle)",
		bg: "color-mix(in oklch, var(--cat-vehicle) 12%, transparent)"
	},
	rejected: {
		label: "Rejected",
		color: "var(--ink-3)",
		bg: "var(--surface-2)"
	},
	dead: {
		label: "Dead",
		color: "var(--red)",
		bg: "color-mix(in oklch, var(--red) 12%, transparent)"
	}
};
var FILTERS = [
	{
		key: "all",
		label: "All"
	},
	{
		key: "pending",
		label: "Pending"
	},
	{
		key: "approved",
		label: "Approved"
	},
	{
		key: "rejected",
		label: "Rejected"
	},
	{
		key: "dead",
		label: "Dead"
	}
];
var SOURCE_LABELS = {
	airbnb: "Airbnb",
	facebook: "Facebook",
	"facebook-events": "Facebook Events",
	linkedin: "LinkedIn",
	edc: "EDC",
	homestra: "Homestra",
	boligsiden: "Boligsiden",
	boliga: "Boliga"
};
var SOURCE_DOMAINS = {
	airbnb: "airbnb.com",
	facebook: "facebook.com",
	"facebook-events": "facebook.com",
	linkedin: "linkedin.com",
	edc: "edc.dk",
	homestra: "homestra.com",
	boligsiden: "boligsiden.dk",
	boliga: "boliga.dk"
};
function ScrapingSourcesPage() {
	const search$ = useSearch({ from: "/_admin/admin/scraping/sources" });
	const navigate = useNavigate({ from: "/admin/scraping/sources" });
	const [statusFilter, setStatusFilter] = useState("pending");
	const [search, setSearch] = useState("");
	const queryClient = useQueryClient();
	const { data, isLoading } = useQuery({
		queryKey: [
			"admin",
			"source-candidates",
			{ status: statusFilter }
		],
		queryFn: () => listSourceCandidatesFn({ data: { status: statusFilter === "all" ? void 0 : statusFilter } })
	});
	const { data: builtIn, isLoading: builtInLoading } = useQuery({
		queryKey: ["admin", "built-in-sources"],
		queryFn: () => listBuiltInSourcesFn()
	});
	const { data: pendingData } = useQuery({
		queryKey: [
			"admin",
			"source-candidates",
			{ status: "pending" }
		],
		queryFn: () => listSourceCandidatesFn({ data: { status: "pending" } })
	});
	const pendingCount = pendingData?.items.length ?? 0;
	const tab = search$.tab ?? (pendingCount > 0 ? "discovery" : "active");
	useEffect(() => {
		if (!search$.tab) navigate({
			search: (prev) => ({
				...prev,
				tab: pendingCount > 0 ? "discovery" : "active"
			}),
			replace: true
		});
	}, [pendingCount]);
	const setTab = (next) => navigate({ search: (prev) => ({
		...prev,
		tab: next
	}) });
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["admin", "source-candidates"] });
		queryClient.invalidateQueries({ queryKey: ["admin", "built-in-sources"] });
	};
	const updateMutation = useMutation({
		mutationFn: (args) => updateSourceCandidateStatusFn({ data: args }),
		onSuccess: invalidate
	});
	const items = data?.items ?? [];
	const filteredItems = useMemo(() => {
		if (!search.trim()) return items;
		const q = search.toLowerCase();
		return items.filter((c) => c.domain.toLowerCase().includes(q));
	}, [items, search]);
	const stats = useMemo(() => {
		const s = {
			pending: 0,
			approved: 0,
			rejected: 0,
			dead: 0,
			total: items.length
		};
		for (const c of items) s[c.status] = (s[c.status] ?? 0) + 1;
		return s;
	}, [items]);
	const activeItems = builtIn?.items ?? [];
	const activeTotal = activeItems.reduce((a, b) => a + b.total, 0);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "meta-label",
						style: { color: "var(--ink-3)" },
						children: "03 · Pipeline · Sources"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "font-display text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] font-medium leading-none tracking-tight text-foreground",
						children: "Sources"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "max-w-2xl text-sm leading-relaxed",
						style: { color: "var(--ink-2)" },
						children: "Domains the crawler has found, plus the scrapers already ingesting listings into the catalog."
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-end gap-8 border-b border-(--line-1)",
				children: [/* @__PURE__ */ jsx(TabButton, {
					active: tab === "discovery",
					onClick: () => setTab("discovery"),
					label: "Discovery",
					counter: pendingCount,
					counterAccent: "var(--amber-ink)",
					hint: "awaiting approval"
				}), /* @__PURE__ */ jsx(TabButton, {
					active: tab === "active",
					onClick: () => setTab("active"),
					label: "Active",
					counter: activeItems.length,
					counterAccent: "var(--cat-vehicle)",
					hint: "in use"
				})]
			}),
			tab === "discovery" ? /* @__PURE__ */ jsxs("section", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-px bg-(--line-1) md:grid-cols-4",
						children: [
							/* @__PURE__ */ jsx(StatCell, {
								label: "Pending",
								value: stats.pending,
								color: "var(--amber-ink)"
							}),
							/* @__PURE__ */ jsx(StatCell, {
								label: "Approved",
								value: stats.approved,
								color: "var(--cat-vehicle)"
							}),
							/* @__PURE__ */ jsx(StatCell, {
								label: "Rejected",
								value: stats.rejected,
								color: "var(--ink-3)"
							}),
							/* @__PURE__ */ jsx(StatCell, {
								label: "Dead",
								value: stats.dead,
								color: "var(--red)"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-6",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-6",
							children: [/* @__PURE__ */ jsx("span", {
								className: "meta-label",
								style: { color: "var(--ink-4)" },
								children: "Status"
							}), FILTERS.map((f) => /* @__PURE__ */ jsx(FilterChip, {
								label: f.label,
								active: statusFilter === f.key,
								color: f.key !== "all" ? STATUS_META[f.key].color : void 0,
								onClick: () => setStatusFilter(f.key)
							}, f.key))]
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative ml-auto flex min-w-60 items-center",
							children: [/* @__PURE__ */ jsx(Search, {
								className: "pointer-events-none absolute left-3 h-4 w-4 text-(--ink-3)",
								strokeWidth: 1.5
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								placeholder: "Filter by domain…",
								className: "h-10 w-full border border-(--line-1) bg-background pl-10 pr-3 text-sm outline-none placeholder:text-(--ink-4) focus:border-foreground"
							})]
						})]
					}),
					isLoading ? /* @__PURE__ */ jsx("div", {
						className: "space-y-2",
						children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-full" }, i))
					}) : filteredItems.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "border border-(--line-1) bg-background p-16 text-center",
						children: [/* @__PURE__ */ jsx("p", {
							className: "font-display text-xl text-foreground",
							children: "No candidates."
						}), /* @__PURE__ */ jsxs("p", {
							className: "mt-2 text-sm",
							style: { color: "var(--ink-3)" },
							children: [
								"Run",
								" ",
								/* @__PURE__ */ jsx("span", {
									className: "rounded bg-(--surface-2) px-1.5 py-0.5 font-mono text-xs text-foreground",
									children: "npx tsx scripts/scraping/discovery.ts"
								}),
								" ",
								"to discover new sources."
							]
						})]
					}) : /* @__PURE__ */ jsx("div", {
						className: "divide-y divide-(--line-1) border border-(--line-1) bg-background",
						children: filteredItems.map((c) => /* @__PURE__ */ jsx(CandidateRow, {
							id: c.id,
							domain: c.domain,
							status: c.status,
							discoveredFrom: c.discoveredFrom,
							notes: c.notes,
							pending: updateMutation.isPending,
							onAct: (status) => updateMutation.mutate({
								id: c.id,
								status
							})
						}, c.id))
					})
				]
			}) : /* @__PURE__ */ jsxs("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex items-baseline justify-between",
					children: /* @__PURE__ */ jsxs("span", {
						className: "meta-label",
						style: { color: "var(--ink-4)" },
						children: [
							activeItems.length,
							" approved · ",
							activeTotal.toLocaleString(),
							" items ingested"
						]
					})
				}), builtInLoading ? /* @__PURE__ */ jsx("div", {
					className: "space-y-2",
					children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-full" }, i))
				}) : activeItems.length === 0 ? /* @__PURE__ */ jsxs("div", {
					className: "border border-(--line-1) bg-background p-16 text-center",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-display text-xl text-foreground",
						children: "No active sources yet."
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm",
						style: { color: "var(--ink-3)" },
						children: "Approve a candidate in the Discovery tab to add it here."
					})]
				}) : /* @__PURE__ */ jsx("div", {
					className: "divide-y divide-(--line-1) border border-(--line-1) bg-background",
					children: activeItems.map((s) => /* @__PURE__ */ jsx(BuiltInRow, {
						kind: s.kind,
						label: s.label ?? SOURCE_LABELS[s.source] ?? s.source,
						domain: s.domain ?? SOURCE_DOMAINS[s.source] ?? s.source,
						total: s.total,
						pending: s.pending,
						published: s.published,
						rejected: s.rejected,
						lastSeenAt: s.lastSeenAt
					}, `${s.kind}-${s.source}`))
				})]
			})
		]
	});
}
function TabButton({ active, onClick, label, counter, counterAccent, hint }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick,
		className: cn("group relative -mb-px flex items-baseline gap-3 pb-3 text-left transition-colors", active ? "text-foreground" : "text-(--ink-3) hover:text-foreground"),
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "font-display text-2xl font-medium tracking-tight",
				children: label
			}),
			/* @__PURE__ */ jsxs("span", {
				className: "meta-label tabular-nums",
				style: { color: active ? counterAccent : "var(--ink-4)" },
				children: [
					counter,
					" ",
					hint
				]
			}),
			/* @__PURE__ */ jsx("span", {
				className: cn("absolute -bottom-px left-0 right-0 h-0.5 transition-transform", active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"),
				style: { backgroundColor: "var(--foreground)" },
				"aria-hidden": true
			})
		]
	});
}
function StatCell({ label, value, color }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-background p-5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "meta-label mb-2",
			style: { color: "var(--ink-3)" },
			children: label
		}), /* @__PURE__ */ jsx("div", {
			className: "font-display text-3xl font-medium tabular-nums",
			style: { color },
			children: value.toLocaleString()
		})]
	});
}
function FilterChip({ label, active, color, onClick }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick,
		className: cn("group relative inline-flex items-center text-sm transition-colors", active ? "text-foreground" : "text-(--ink-3) hover:text-foreground"),
		children: [label, /* @__PURE__ */ jsx("span", {
			className: cn("absolute -bottom-1 left-0 right-0 h-0.5 transition-transform", active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"),
			style: { backgroundColor: color ?? "var(--foreground)" },
			"aria-hidden": true
		})]
	});
}
function CandidateRow({ domain, status, discoveredFrom, notes, pending, onAct }) {
	const meta = STATUS_META[status];
	return /* @__PURE__ */ jsxs("div", {
		className: "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-(--surface-2)",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex h-10 w-10 shrink-0 items-center justify-center bg-(--surface-2)",
				children: [/* @__PURE__ */ jsx("img", {
					src: `https://www.google.com/s2/favicons?sz=32&domain=${domain}`,
					alt: "",
					className: "h-5 w-5",
					loading: "lazy",
					onError: (e) => {
						e.currentTarget.style.display = "none";
					}
				}), /* @__PURE__ */ jsx(Globe, {
					className: "absolute h-4 w-4 text-(--ink-3)",
					style: { opacity: 0 },
					strokeWidth: 1.5,
					"aria-hidden": true
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsx("a", {
							href: `https://${domain}`,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "truncate text-sm font-medium text-foreground hover:underline",
							children: domain
						}),
						/* @__PURE__ */ jsx(ExternalLink, {
							className: "h-3 w-3 text-(--ink-4)",
							strokeWidth: 1.5
						}),
						/* @__PURE__ */ jsx("span", {
							className: "meta-label inline-flex h-5 items-center px-2",
							style: {
								color: meta.color,
								backgroundColor: meta.bg
							},
							children: meta.label
						})
					]
				}), (discoveredFrom ?? notes) && /* @__PURE__ */ jsxs("div", {
					className: "meta-label mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 truncate",
					style: { color: "var(--ink-3)" },
					children: [discoveredFrom && /* @__PURE__ */ jsxs("span", {
						className: "truncate",
						children: [
							"via",
							" ",
							/* @__PURE__ */ jsx("a", {
								href: discoveredFrom,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "hover:text-foreground",
								children: discoveredFrom.replace(/^https?:\/\//, "").slice(0, 60)
							})
						]
					}), notes && /* @__PURE__ */ jsx("span", {
						className: "truncate font-mono text-[10px]",
						children: notes
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(RowAction, {
						icon: pending ? Loader2 : CheckCircle2,
						label: "Approve",
						disabled: pending || status === "approved",
						onClick: () => onAct("approved"),
						accent: "var(--cat-vehicle)",
						spin: pending
					}),
					/* @__PURE__ */ jsx(RowAction, {
						icon: XCircle,
						label: "Reject",
						disabled: pending || status === "rejected",
						onClick: () => onAct("rejected"),
						accent: "var(--ink-3)"
					}),
					/* @__PURE__ */ jsx(RowAction, {
						icon: Skull,
						label: "Dead",
						disabled: pending || status === "dead",
						onClick: () => onAct("dead"),
						accent: "var(--red)"
					})
				]
			})
		]
	});
}
function RowAction({ icon: Icon, label, disabled, onClick, accent, spin }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		disabled,
		onClick,
		className: cn("inline-flex h-8 items-center gap-1.5 border border-(--line-1) bg-background px-3 text-xs font-medium transition-colors", disabled ? "cursor-not-allowed text-(--ink-4) opacity-40" : "text-(--ink-1) hover:bg-(--surface-2)"),
		title: label,
		children: [/* @__PURE__ */ jsx(Icon, {
			className: cn("h-3.5 w-3.5", spin && "animate-spin"),
			style: { color: accent },
			strokeWidth: 1.5
		}), label]
	});
}
function BuiltInRow({ kind, label, domain, total, pending, published, rejected, lastSeenAt }) {
	const favicon = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
	const lastSeen = lastSeenAt ? formatRelative(lastSeenAt) : null;
	const isAwaiting = kind === "approved-candidate";
	return /* @__PURE__ */ jsxs("div", {
		className: "grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-(--surface-2)",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex h-10 w-10 shrink-0 items-center justify-center bg-(--surface-2)",
				children: [/* @__PURE__ */ jsx("img", {
					src: favicon,
					alt: "",
					className: "h-5 w-5",
					loading: "lazy",
					onError: (e) => {
						e.currentTarget.style.display = "none";
					}
				}), /* @__PURE__ */ jsx(Globe, {
					className: "absolute h-4 w-4 text-(--ink-3)",
					style: { opacity: 0 },
					strokeWidth: 1.5,
					"aria-hidden": true
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "truncate text-sm font-medium text-foreground",
							children: label
						}),
						/* @__PURE__ */ jsxs("a", {
							href: `https://${domain}`,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "inline-flex items-center gap-1 text-xs text-(--ink-3) hover:text-foreground",
							children: [domain, /* @__PURE__ */ jsx(ExternalLink, {
								className: "h-3 w-3",
								strokeWidth: 1.5
							})]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "meta-label inline-flex h-5 items-center gap-1 px-2",
							style: {
								color: "var(--cat-vehicle)",
								backgroundColor: "color-mix(in oklch, var(--cat-vehicle) 12%, transparent)"
							},
							children: [/* @__PURE__ */ jsx(ShieldCheck, {
								className: "h-3 w-3",
								strokeWidth: 1.75
							}), isAwaiting ? "Approved · awaiting scraper" : "Approved"]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "meta-label mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5",
					style: { color: "var(--ink-3)" },
					children: isAwaiting ? /* @__PURE__ */ jsx("span", { children: "No scraper wired yet — add one under scripts/scraping/" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsxs("span", {
							className: "tabular-nums",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-foreground",
								children: total.toLocaleString()
							}), " items"]
						}),
						published > 0 && /* @__PURE__ */ jsxs("span", {
							className: "tabular-nums",
							style: { color: "var(--cat-vehicle)" },
							children: [published, " published"]
						}),
						pending > 0 && /* @__PURE__ */ jsxs("span", {
							className: "tabular-nums",
							style: { color: "var(--amber-ink)" },
							children: [pending, " pending"]
						}),
						rejected > 0 && /* @__PURE__ */ jsxs("span", {
							className: "tabular-nums",
							children: [rejected, " rejected"]
						}),
						lastSeen && /* @__PURE__ */ jsxs("span", { children: ["· last seen ", lastSeen] })
					] })
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "hidden min-w-32 md:block",
				children: isAwaiting ? /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full bg-(--surface-2)" }) : /* @__PURE__ */ jsx(SourceMiniBar, {
					published,
					pending,
					rejected,
					total
				})
			}),
			/* @__PURE__ */ jsxs(Link, {
				to: "/admin/scraping",
				className: "inline-flex h-8 items-center gap-1.5 border border-(--line-1) bg-background px-3 text-xs font-medium text-(--ink-1) transition-colors hover:bg-(--surface-2)",
				children: ["Review queue", /* @__PURE__ */ jsx(ArrowUpRight, {
					className: "h-3.5 w-3.5",
					strokeWidth: 1.5
				})]
			})
		]
	});
}
function SourceMiniBar({ published, pending, rejected, total }) {
	if (total === 0) return /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full bg-(--surface-2)" });
	const pub = published / total * 100;
	const pen = pending / total * 100;
	const rej = rejected / total * 100;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-1.5 w-full overflow-hidden bg-(--surface-2)",
		title: `${published} published · ${pending} pending · ${rejected} rejected`,
		children: [
			pub > 0 && /* @__PURE__ */ jsx("div", { style: {
				width: `${pub}%`,
				backgroundColor: "var(--cat-vehicle)"
			} }),
			pen > 0 && /* @__PURE__ */ jsx("div", { style: {
				width: `${pen}%`,
				backgroundColor: "var(--amber-ink)"
			} }),
			rej > 0 && /* @__PURE__ */ jsx("div", { style: {
				width: `${rej}%`,
				backgroundColor: "var(--ink-4)"
			} })
		]
	});
}
function formatRelative(iso) {
	const ts = new Date(iso).getTime();
	if (!Number.isFinite(ts)) return "";
	const diff = Date.now() - ts;
	const m = Math.round(diff / 6e4);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.round(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.round(h / 24);
	if (d < 30) return `${d}d ago`;
	return new Date(iso).toLocaleDateString();
}
//#endregion
//#region src/routes/_admin/admin/scraping/sources.tsx?tsr-split=component
var SplitComponent = ScrapingSourcesPage;
//#endregion
export { SplitComponent as component };
