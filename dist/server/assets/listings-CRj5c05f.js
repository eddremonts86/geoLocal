import { t as cn } from "./utils-C17k1q7P.js";
import { t as Skeleton } from "./skeleton-CRJxhCYm.js";
import { i as updateListingStatusFn, n as deleteListingFn, r as getAdminListingsFn } from "./admin-listings.fn-CZig8Yyg.js";
import { a as DropdownMenuSeparator, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-DK24gMQb.js";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Car, ChevronLeft, ChevronRight, ExternalLink, Eye, EyeOff, FileText, Home, MoreHorizontal, Pencil, Search, Sparkles, Trash2, Wrench, X } from "lucide-react";
//#region src/modules/admin/ui/ListingsTablePage.tsx
var CATEGORY_META = {
	property: {
		label: "Property",
		icon: Home,
		color: "var(--cat-property)"
	},
	vehicle: {
		label: "Vehicle",
		icon: Car,
		color: "var(--cat-vehicle)"
	},
	service: {
		label: "Service",
		icon: Wrench,
		color: "var(--cat-service)"
	},
	experience: {
		label: "Experience",
		icon: Sparkles,
		color: "var(--cat-experience)"
	}
};
var STATUS_META = {
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
function ListingsTablePage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
	const pageSize = 20;
	const { data, isLoading, isFetching } = useQuery({
		queryKey: [
			"admin",
			"listings",
			{
				search,
				categoryFilter,
				statusFilter,
				page
			}
		],
		queryFn: () => getAdminListingsFn({ data: {
			query: search || void 0,
			category: categoryFilter !== "all" ? categoryFilter : void 0,
			status: statusFilter !== "all" ? statusFilter : void 0,
			page,
			pageSize
		} })
	});
	const statusMutation = useMutation({
		mutationFn: (vars) => updateListingStatusFn({ data: vars }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "badges"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
		}
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => deleteListingFn({ data: { id } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "badges"] });
		}
	});
	const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
	const items = data?.items ?? [];
	const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));
	const toggleAll = () => {
		setSelected((prev) => {
			if (allSelected) return /* @__PURE__ */ new Set();
			const next = new Set(prev);
			items.forEach((i) => next.add(i.id));
			return next;
		});
	};
	const toggleOne = (id) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const clearSelection = () => setSelected(/* @__PURE__ */ new Set());
	const bulkApply = async (status) => {
		await Promise.all(Array.from(selected).map((id) => statusMutation.mutateAsync({
			id,
			status
		})));
		clearSelection();
	};
	const bulkDelete = async () => {
		if (!confirm(`Delete ${selected.size} listing(s)? This cannot be undone.`)) return;
		await Promise.all(Array.from(selected).map((id) => deleteMutation.mutateAsync(id)));
		clearSelection();
	};
	const resetFilters = () => {
		setSearch("");
		setCategoryFilter("all");
		setStatusFilter("all");
		setPage(1);
	};
	const hasActiveFilter = search !== "" || categoryFilter !== "all" || statusFilter !== "all";
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-10",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex flex-wrap items-end justify-between gap-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "meta-label",
							style: { color: "var(--ink-3)" },
							children: "02 · Catalog"
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "font-display text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] font-medium leading-none tracking-tight text-foreground",
							children: "Listings"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm tabular-nums",
							style: { color: "var(--ink-3)" },
							children: isLoading ? "Loading…" : `${data?.total.toLocaleString() ?? 0} total` + (hasActiveFilter ? " · filtered" : "")
						})
					]
				}), /* @__PURE__ */ jsxs(Link, {
					to: "/admin/listings/new",
					className: "inline-flex h-10 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90",
					children: [/* @__PURE__ */ jsx(FileText, {
						className: "h-4 w-4",
						strokeWidth: 1.5
					}), "New listing"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "relative flex min-w-60 flex-1 items-center",
							children: [/* @__PURE__ */ jsx(Search, {
								className: "pointer-events-none absolute left-3 h-4 w-4 text-(--ink-3)",
								strokeWidth: 1.5
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								value: search,
								onChange: (e) => {
									setSearch(e.target.value);
									setPage(1);
								},
								placeholder: "Search by title, address, or city…",
								className: "h-10 w-full border border-(--line-1) bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-(--ink-4) focus:border-foreground"
							})]
						}), hasActiveFilter && /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: resetFilters,
							className: "meta-label flex h-10 items-center gap-1 px-2 text-(--ink-3) hover:text-foreground",
							children: [/* @__PURE__ */ jsx(X, {
								className: "h-3.5 w-3.5",
								strokeWidth: 1.5
							}), "Reset"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-6",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "meta-label",
								style: { color: "var(--ink-4)" },
								children: "Category"
							}),
							/* @__PURE__ */ jsx(CategoryChip, {
								label: "All",
								active: categoryFilter === "all",
								onClick: () => {
									setCategoryFilter("all");
									setPage(1);
								}
							}),
							Object.keys(CATEGORY_META).map((c) => /* @__PURE__ */ jsx(CategoryChip, {
								label: CATEGORY_META[c].label,
								color: CATEGORY_META[c].color,
								active: categoryFilter === c,
								onClick: () => {
									setCategoryFilter(c);
									setPage(1);
								}
							}, c))
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-6",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "meta-label",
								style: { color: "var(--ink-4)" },
								children: "Status"
							}),
							/* @__PURE__ */ jsx(CategoryChip, {
								label: "All",
								active: statusFilter === "all",
								onClick: () => {
									setStatusFilter("all");
									setPage(1);
								}
							}),
							Object.keys(STATUS_META).map((s) => /* @__PURE__ */ jsx(CategoryChip, {
								label: STATUS_META[s].label,
								color: STATUS_META[s].color,
								active: statusFilter === s,
								onClick: () => {
									setStatusFilter(s);
									setPage(1);
								}
							}, s))
						]
					})
				]
			}),
			selected.size > 0 && /* @__PURE__ */ jsxs("div", {
				className: "sticky top-14 z-30 flex items-center justify-between border border-(--line-1) bg-(--surface-2) px-5 py-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "meta-label",
						style: { color: "var(--ink-2)" },
						children: [selected.size, " selected"]
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: clearSelection,
						className: "meta-label text-(--ink-3) hover:text-foreground",
						children: "Clear"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsx(BulkButton, {
							onClick: () => bulkApply("published"),
							icon: Eye,
							label: "Publish"
						}),
						/* @__PURE__ */ jsx(BulkButton, {
							onClick: () => bulkApply("draft"),
							icon: EyeOff,
							label: "Unpublish"
						}),
						/* @__PURE__ */ jsx(BulkButton, {
							onClick: () => bulkApply("archived"),
							icon: Archive,
							label: "Archive"
						}),
						/* @__PURE__ */ jsx(BulkButton, {
							onClick: bulkDelete,
							icon: Trash2,
							label: "Delete",
							danger: true
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "border border-(--line-1) bg-background",
				children: /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
							className: "border-b border-(--line-1) text-left",
							children: [
								/* @__PURE__ */ jsx("th", {
									className: "w-10 px-4 py-3",
									children: /* @__PURE__ */ jsx("input", {
										type: "checkbox",
										checked: allSelected,
										onChange: toggleAll,
										"aria-label": "Select all",
										className: "h-3.5 w-3.5 accent-foreground"
									})
								}),
								/* @__PURE__ */ jsx("th", {
									className: "meta-label px-4 py-3",
									style: { color: "var(--ink-3)" },
									children: "Listing"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "meta-label px-4 py-3",
									style: { color: "var(--ink-3)" },
									children: "Category"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "meta-label px-4 py-3",
									style: { color: "var(--ink-3)" },
									children: "Transaction"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "meta-label px-4 py-3 text-right",
									style: { color: "var(--ink-3)" },
									children: "Price"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "meta-label px-4 py-3",
									style: { color: "var(--ink-3)" },
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "meta-label px-4 py-3",
									style: { color: "var(--ink-3)" },
									children: "Updated"
								}),
								/* @__PURE__ */ jsx("th", { className: "w-10 px-4 py-3" })
							]
						}) }), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-(--line-1)",
							children: isLoading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
								colSpan: 8,
								className: "p-3",
								children: /* @__PURE__ */ jsx(Skeleton, { className: "h-14 w-full" })
							}) }, i)) : items.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
								colSpan: 8,
								className: "p-16 text-center",
								children: /* @__PURE__ */ jsxs("div", {
									className: "mx-auto max-w-sm space-y-3",
									children: [
										/* @__PURE__ */ jsx("p", {
											className: "font-display text-xl text-foreground",
											children: "No listings match."
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-sm",
											style: { color: "var(--ink-3)" },
											children: "Try clearing filters or create a new listing."
										}),
										hasActiveFilter && /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: resetFilters,
											className: "meta-label text-(--ink-2) underline underline-offset-4",
											children: "Reset filters"
										})
									]
								})
							}) }) : items.map((item) => {
								const meta = CATEGORY_META[item.category] ?? CATEGORY_META.property;
								const Icon = meta.icon;
								const sel = selected.has(item.id);
								return /* @__PURE__ */ jsxs("tr", {
									className: cn("transition-colors hover:bg-(--surface-2)", sel && "bg-(--surface-2)"),
									children: [
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsx("input", {
												type: "checkbox",
												checked: sel,
												onChange: () => toggleOne(item.id),
												"aria-label": `Select ${item.title}`,
												className: "h-3.5 w-3.5 accent-foreground"
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-3",
												children: [item.coverUrl ? /* @__PURE__ */ jsx("img", {
													src: item.coverUrl,
													alt: "",
													className: "h-12 w-12 shrink-0 object-cover",
													loading: "lazy"
												}) : /* @__PURE__ */ jsx("div", {
													className: "flex h-12 w-12 shrink-0 items-center justify-center bg-(--surface-3)",
													children: /* @__PURE__ */ jsx(Icon, {
														className: "h-4 w-4 text-(--ink-3)",
														strokeWidth: 1.5
													})
												}), /* @__PURE__ */ jsxs("div", {
													className: "min-w-0",
													children: [/* @__PURE__ */ jsx(Link, {
														to: "/admin/listings/$id",
														params: { id: item.id },
														className: "block truncate text-sm font-medium text-foreground hover:underline",
														children: item.title
													}), /* @__PURE__ */ jsx("div", {
														className: "meta-label mt-0.5 truncate",
														style: { color: "var(--ink-3)" },
														children: item.city
													})]
												})]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsxs("span", {
												className: "meta-label inline-flex items-center gap-1.5",
												style: { color: meta.color },
												children: [/* @__PURE__ */ jsx(Icon, {
													className: "h-3 w-3",
													strokeWidth: 1.5
												}), item.subCategory]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3 capitalize text-(--ink-2)",
											children: item.transactionType
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3 text-right font-medium tabular-nums text-foreground",
											children: new Intl.NumberFormat("en-DK", {
												style: "currency",
												currency: item.currency,
												maximumFractionDigits: 0
											}).format(item.price)
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsx(StatusPill, { status: item.status })
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3 text-xs tabular-nums",
											style: { color: "var(--ink-3)" },
											children: /* @__PURE__ */ jsx(RelativeTime, { iso: item.createdAt })
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsx(RowMenu, {
												id: item.id,
												slug: item.slug,
												status: item.status,
												onStatus: (s) => statusMutation.mutate({
													id: item.id,
													status: s
												}),
												onDelete: () => {
													if (confirm("Delete this listing?")) deleteMutation.mutate(item.id);
												}
											})
										})
									]
								}, item.id);
							})
						})]
					})
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between border-t border-(--line-1) pt-6",
				children: [/* @__PURE__ */ jsx("span", {
					className: "meta-label",
					style: { color: "var(--ink-3)" },
					children: isFetching ? "Updating…" : `Page ${page} of ${totalPages}`
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-1",
					children: [/* @__PURE__ */ jsx(PagerButton, {
						disabled: page <= 1,
						onClick: () => setPage((p) => p - 1),
						icon: ChevronLeft,
						label: "Previous"
					}), /* @__PURE__ */ jsx(PagerButton, {
						disabled: page >= totalPages,
						onClick: () => setPage((p) => p + 1),
						icon: ChevronRight,
						label: "Next",
						iconEnd: true
					})]
				})]
			})
		]
	});
}
function CategoryChip({ label, color, active, onClick }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick,
		className: cn("group relative inline-flex items-center gap-1.5 text-sm transition-colors", active ? "text-foreground" : "text-(--ink-3) hover:text-foreground"),
		children: [label, /* @__PURE__ */ jsx("span", {
			className: cn("absolute -bottom-1 left-0 right-0 h-0.5 transition-transform", active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"),
			style: { backgroundColor: color ?? "var(--foreground)" },
			"aria-hidden": true
		})]
	});
}
function StatusPill({ status }) {
	const m = STATUS_META[status];
	return /* @__PURE__ */ jsx("span", {
		className: "meta-label inline-flex h-6 items-center px-2",
		style: {
			color: m.color,
			backgroundColor: m.bg
		},
		children: m.label
	});
}
function RelativeTime({ iso }) {
	const label = useMemo(() => {
		const date = new Date(iso);
		const diff = Date.now() - date.getTime();
		const mins = Math.floor(diff / 6e4);
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		return date.toLocaleDateString();
	}, [iso]);
	return /* @__PURE__ */ jsx("span", {
		title: new Date(iso).toLocaleString(),
		children: label
	});
}
function BulkButton({ onClick, icon: Icon, label, danger }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick,
		className: cn("inline-flex h-8 items-center gap-1.5 border px-3 text-xs font-medium transition-colors", danger ? "border-(--red)/20 text-(--red) hover:bg-(--red)/10" : "border-(--line-1) text-(--ink-1) hover:bg-background"),
		children: [/* @__PURE__ */ jsx(Icon, {
			className: "h-3.5 w-3.5",
			strokeWidth: 1.5
		}), label]
	});
}
function PagerButton({ disabled, onClick, icon: Icon, label, iconEnd }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		disabled,
		onClick,
		className: cn("inline-flex h-9 items-center gap-1.5 border border-(--line-1) bg-background px-3 text-xs font-medium transition-colors", disabled ? "cursor-not-allowed text-(--ink-4)" : "text-(--ink-1) hover:bg-(--surface-2)"),
		children: [
			!iconEnd && /* @__PURE__ */ jsx(Icon, {
				className: "h-3.5 w-3.5",
				strokeWidth: 1.5
			}),
			label,
			iconEnd && /* @__PURE__ */ jsx(Icon, {
				className: "h-3.5 w-3.5",
				strokeWidth: 1.5
			})
		]
	});
}
function RowMenu({ id, slug, status, onStatus, onDelete }) {
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "Row actions",
			className: "flex h-8 w-8 items-center justify-center text-(--ink-3) hover:bg-(--surface-2) hover:text-foreground",
			children: /* @__PURE__ */ jsx(MoreHorizontal, {
				className: "h-4 w-4",
				strokeWidth: 1.5
			})
		})
	}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
		align: "end",
		className: "w-48 rounded-none",
		children: [
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/admin/listings/$id",
					params: { id },
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Pencil, {
						className: "h-3.5 w-3.5",
						strokeWidth: 1.5
					}), " Edit"]
				})
			}),
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/listing/$slug",
					params: { slug },
					target: "_blank",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(ExternalLink, {
						className: "h-3.5 w-3.5",
						strokeWidth: 1.5
					}), " View public"]
				})
			}),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			status !== "published" && /* @__PURE__ */ jsxs(DropdownMenuItem, {
				onSelect: () => onStatus("published"),
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx(Eye, {
					className: "h-3.5 w-3.5",
					strokeWidth: 1.5
				}), " Publish"]
			}),
			status === "published" && /* @__PURE__ */ jsxs(DropdownMenuItem, {
				onSelect: () => onStatus("draft"),
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx(EyeOff, {
					className: "h-3.5 w-3.5",
					strokeWidth: 1.5
				}), " Unpublish"]
			}),
			/* @__PURE__ */ jsxs(DropdownMenuItem, {
				onSelect: () => onStatus("archived"),
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx(Archive, {
					className: "h-3.5 w-3.5",
					strokeWidth: 1.5
				}), " Archive"]
			}),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			/* @__PURE__ */ jsxs(DropdownMenuItem, {
				onSelect: onDelete,
				className: "flex items-center gap-2",
				style: { color: "var(--red)" },
				children: [/* @__PURE__ */ jsx(Trash2, {
					className: "h-3.5 w-3.5",
					strokeWidth: 1.5
				}), " Delete"]
			})
		]
	})] });
}
//#endregion
//#region src/routes/_admin/admin/listings/index.tsx?tsr-split=component
var SplitComponent = ListingsTablePage;
//#endregion
export { SplitComponent as component };
