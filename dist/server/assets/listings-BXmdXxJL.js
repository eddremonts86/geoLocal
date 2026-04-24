import { t as Badge } from "./badge-CU7K8A-s.js";
import { t as Button } from "./button-DX0eJ04i.js";
import { n as CardContent, t as Card } from "./card-B8NGx3EZ.js";
import { t as Skeleton } from "./skeleton-ePPLs61V.js";
import { i as updateListingStatusFn, n as deleteListingFn, r as getAdminListingsFn } from "./admin-listings.fn-x63yI3Wx.js";
import { t as Input } from "./input-DIdDhyf2.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CqwaSWzq.js";
import { a as DropdownMenuTrigger, i as DropdownMenuSeparator, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CIGqjYoW.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Archive, Car, ChevronLeft, ChevronRight, Eye, EyeOff, Home, MoreHorizontal, Pencil, Plus, Search, Sparkles, Trash2, Wrench } from "lucide-react";
//#region src/modules/admin/ui/ListingsTablePage.tsx
var categoryIcons = {
	property: Home,
	vehicle: Car,
	service: Wrench,
	experience: Sparkles
};
var statusColors = {
	draft: "bg-yellow-500/10 text-yellow-600",
	published: "bg-green-500/10 text-green-600",
	archived: "bg-gray-500/10 text-gray-500"
};
function ListingsTablePage() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [page, setPage] = useState(1);
	const pageSize = 20;
	const { data, isLoading } = useQuery({
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
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "listings"] })
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => deleteListingFn({ data: { id } }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "listings"] })
	});
	const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 p-6 lg:p-8",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold text-foreground",
					children: t("admin.listings", "Listings")
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: data ? `${data.total} total` : ""
				})] }), /* @__PURE__ */ jsx(Link, {
					to: "/admin/listings/new",
					children: /* @__PURE__ */ jsxs(Button, {
						className: "gap-2",
						children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), t("admin.newListing", "New Listing")]
					})
				})]
			}),
			/* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, {
				className: "flex flex-wrap items-center gap-3 p-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "relative flex-1 min-w-[200px]",
						children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
							placeholder: t("admin.searchListings", "Search listings..."),
							value: search,
							onChange: (e) => {
								setSearch(e.target.value);
								setPage(1);
							},
							className: "pl-9"
						})]
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: categoryFilter,
						onValueChange: (v) => {
							setCategoryFilter(v);
							setPage(1);
						},
						children: [/* @__PURE__ */ jsx(SelectTrigger, {
							className: "w-[150px]",
							children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Category" })
						}), /* @__PURE__ */ jsxs(SelectContent, { children: [
							/* @__PURE__ */ jsx(SelectItem, {
								value: "all",
								children: "All Categories"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "property",
								children: "Property"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "vehicle",
								children: "Vehicle"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "service",
								children: "Service"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "experience",
								children: "Experience"
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
							className: "w-[140px]",
							children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Status" })
						}), /* @__PURE__ */ jsxs(SelectContent, { children: [
							/* @__PURE__ */ jsx(SelectItem, {
								value: "all",
								children: "All Status"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "draft",
								children: "Draft"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "published",
								children: "Published"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "archived",
								children: "Archived"
							})
						] })]
					})
				]
			}) }),
			/* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, {
				className: "p-0",
				children: isLoading ? /* @__PURE__ */ jsx("div", {
					className: "space-y-3 p-4",
					children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-14 w-full" }, i))
				}) : /* @__PURE__ */ jsxs("div", {
					className: "overflow-x-auto",
					children: [/* @__PURE__ */ jsxs("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
							className: "border-b border-border text-left",
							children: [
								/* @__PURE__ */ jsx("th", {
									className: "p-4 font-medium text-muted-foreground",
									children: "Listing"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "p-4 font-medium text-muted-foreground",
									children: "Category"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "p-4 font-medium text-muted-foreground",
									children: "Type"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "p-4 font-medium text-muted-foreground",
									children: "Price"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "p-4 font-medium text-muted-foreground",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "p-4 font-medium text-muted-foreground",
									children: "Date"
								}),
								/* @__PURE__ */ jsx("th", { className: "p-4 font-medium text-muted-foreground" })
							]
						}) }), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-border",
							children: data?.items.map((item) => {
								const Icon = categoryIcons[item.category] ?? Home;
								return /* @__PURE__ */ jsxs(m.tr, {
									initial: { opacity: 0 },
									animate: { opacity: 1 },
									className: "hover:bg-muted/50 transition-colors",
									children: [
										/* @__PURE__ */ jsx("td", {
											className: "p-4",
											children: /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-3",
												children: [item.coverUrl ? /* @__PURE__ */ jsx("img", {
													src: item.coverUrl,
													alt: "",
													className: "h-10 w-14 rounded object-cover"
												}) : /* @__PURE__ */ jsx("div", {
													className: "flex h-10 w-14 items-center justify-center rounded bg-muted",
													children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-muted-foreground" })
												}), /* @__PURE__ */ jsxs("div", {
													className: "min-w-0",
													children: [/* @__PURE__ */ jsx("p", {
														className: "truncate font-medium",
														children: item.title
													}), /* @__PURE__ */ jsx("p", {
														className: "text-xs text-muted-foreground",
														children: item.city
													})]
												})]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4",
											children: /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-1.5",
												children: [/* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }), item.subCategory]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 capitalize",
											children: item.transactionType
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 font-medium",
											children: new Intl.NumberFormat("en-DK", {
												style: "currency",
												currency: item.currency,
												maximumFractionDigits: 0
											}).format(item.price)
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4",
											children: /* @__PURE__ */ jsx(Badge, {
												variant: "secondary",
												className: statusColors[item.status] ?? "",
												children: item.status
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 text-muted-foreground",
											children: new Date(item.createdAt).toLocaleDateString()
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4",
											children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
												asChild: true,
												children: /* @__PURE__ */ jsx(Button, {
													variant: "ghost",
													size: "sm",
													children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
												})
											}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
												align: "end",
												children: [
													/* @__PURE__ */ jsx(DropdownMenuItem, {
														asChild: true,
														children: /* @__PURE__ */ jsxs(Link, {
															to: "/admin/listings/$id",
															params: { id: item.id },
															children: [/* @__PURE__ */ jsx(Pencil, { className: "mr-2 h-4 w-4" }), " Edit"]
														})
													}),
													item.status !== "published" && /* @__PURE__ */ jsxs(DropdownMenuItem, {
														onClick: () => statusMutation.mutate({
															id: item.id,
															status: "published"
														}),
														children: [/* @__PURE__ */ jsx(Eye, { className: "mr-2 h-4 w-4" }), " Publish"]
													}),
													item.status === "published" && /* @__PURE__ */ jsxs(DropdownMenuItem, {
														onClick: () => statusMutation.mutate({
															id: item.id,
															status: "draft"
														}),
														children: [/* @__PURE__ */ jsx(EyeOff, { className: "mr-2 h-4 w-4" }), " Unpublish"]
													}),
													/* @__PURE__ */ jsxs(DropdownMenuItem, {
														onClick: () => statusMutation.mutate({
															id: item.id,
															status: "archived"
														}),
														children: [/* @__PURE__ */ jsx(Archive, { className: "mr-2 h-4 w-4" }), " Archive"]
													}),
													/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
													/* @__PURE__ */ jsxs(DropdownMenuItem, {
														className: "text-destructive",
														onClick: () => {
															if (confirm("Delete this listing?")) deleteMutation.mutate(item.id);
														},
														children: [/* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }), " Delete"]
													})
												]
											})] })
										})
									]
								}, item.id);
							})
						})]
					}), data?.items.length === 0 && /* @__PURE__ */ jsx("p", {
						className: "p-8 text-center text-muted-foreground",
						children: "No listings found"
					})]
				})
			}) }),
			totalPages > 1 && /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Page ",
						page,
						" of ",
						totalPages
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						size: "sm",
						disabled: page <= 1,
						onClick: () => setPage((p) => p - 1),
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
					}), /* @__PURE__ */ jsx(Button, {
						variant: "outline",
						size: "sm",
						disabled: page >= totalPages,
						onClick: () => setPage((p) => p + 1),
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
					})]
				})]
			})
		]
	});
}
//#endregion
//#region src/routes/_admin/admin/listings/index.tsx?tsr-split=component
var SplitComponent = ListingsTablePage;
//#endregion
export { SplitComponent as component };
