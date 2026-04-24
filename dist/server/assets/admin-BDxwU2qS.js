import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-CoTEs1AR.js";
import { t as Badge } from "./badge-CU7K8A-s.js";
import { t as Button } from "./button-DX0eJ04i.js";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-B8NGx3EZ.js";
import { t as Skeleton } from "./skeleton-ePPLs61V.js";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Car, Eye, FileText, Home, Plus, Star, Wrench } from "lucide-react";
//#region src/modules/admin/api/admin-stats.fn.ts
var getAdminStatsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("26b3366957b2a8598345b4c1cb62a8b116d3a6fe90b4577753278598166b9c79"));
var getRecentListingsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("4d956afcd24172f7e26241eba02632a12c6143fe3e147deff9f8bc71c47e7f59"));
//#endregion
//#region src/modules/admin/ui/DashboardPage.tsx
var categoryIcons = {
	property: Home,
	vehicle: Car,
	service: Wrench
};
var statusColors = {
	draft: "bg-yellow-500/10 text-yellow-600",
	published: "bg-green-500/10 text-green-600",
	archived: "bg-gray-500/10 text-gray-500"
};
var stagger = {
	hidden: {},
	show: { transition: { staggerChildren: .08 } }
};
var cardVariant = {
	hidden: {
		opacity: 0,
		y: 16
	},
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: .35 }
	}
};
function DashboardPage() {
	const { t } = useTranslation();
	const { data: stats, isLoading: statsLoading } = useQuery({
		queryKey: ["admin", "stats"],
		queryFn: () => getAdminStatsFn()
	});
	const { data: recent, isLoading: recentLoading } = useQuery({
		queryKey: ["admin", "recent"],
		queryFn: () => getRecentListingsFn()
	});
	const statCards = [
		{
			label: t("admin.totalListings", "Total Listings"),
			value: stats?.total ?? 0,
			icon: FileText,
			color: "text-primary"
		},
		{
			label: t("admin.properties", "Properties"),
			value: stats?.byCategory?.property ?? 0,
			icon: Home,
			color: "text-blue-500"
		},
		{
			label: t("admin.vehicles", "Vehicles"),
			value: stats?.byCategory?.vehicle ?? 0,
			icon: Car,
			color: "text-emerald-500"
		},
		{
			label: t("admin.services", "Services"),
			value: stats?.byCategory?.service ?? 0,
			icon: Wrench,
			color: "text-amber-500"
		},
		{
			label: t("admin.published", "Published"),
			value: stats?.byStatus?.published ?? 0,
			icon: Eye,
			color: "text-green-500"
		},
		{
			label: t("admin.featured", "Featured"),
			value: stats?.featured ?? 0,
			icon: Star,
			color: "text-yellow-500"
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8 p-6 lg:p-8",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex items-center justify-between",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold text-foreground",
					children: t("admin.dashboard", "Dashboard")
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: t("admin.dashboardDesc", "Overview of your marketplace")
				})] })
			}),
			/* @__PURE__ */ jsx(m.div, {
				variants: stagger,
				initial: "hidden",
				animate: "show",
				className: "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6",
				children: statCards.map((card) => /* @__PURE__ */ jsx(m.div, {
					variants: cardVariant,
					children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, {
						className: "p-4",
						children: statsLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(card.icon, { className: `h-4 w-4 ${card.color}` }), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-muted-foreground",
								children: card.label
							})]
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-2xl font-bold",
							children: card.value.toLocaleString()
						})] })
					}) })
				}, card.label))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ jsx(Link, {
						to: "/admin/listings/new",
						search: { category: "property" },
						children: /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							className: "gap-2",
							children: [
								/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
								/* @__PURE__ */ jsx(Home, { className: "h-4 w-4" }),
								" ",
								t("admin.addProperty", "Add Property")
							]
						})
					}),
					/* @__PURE__ */ jsx(Link, {
						to: "/admin/listings/new",
						search: { category: "vehicle" },
						children: /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							className: "gap-2",
							children: [
								/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
								/* @__PURE__ */ jsx(Car, { className: "h-4 w-4" }),
								" ",
								t("admin.addVehicle", "Add Vehicle")
							]
						})
					}),
					/* @__PURE__ */ jsx(Link, {
						to: "/admin/listings/new",
						search: { category: "service" },
						children: /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							className: "gap-2",
							children: [
								/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
								/* @__PURE__ */ jsx(Wrench, { className: "h-4 w-4" }),
								" ",
								t("admin.addService", "Add Service")
							]
						})
					})
				]
			}),
			/* @__PURE__ */ jsx(m.div, {
				variants: cardVariant,
				initial: "hidden",
				animate: "show",
				children: /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsxs(CardHeader, {
					className: "flex flex-row items-center justify-between",
					children: [/* @__PURE__ */ jsx(CardTitle, {
						className: "text-lg",
						children: t("admin.recentListings", "Recent Listings")
					}), /* @__PURE__ */ jsx(Link, {
						to: "/admin/listings",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							children: t("admin.viewAll", "View All")
						})
					})]
				}), /* @__PURE__ */ jsx(CardContent, { children: recentLoading ? /* @__PURE__ */ jsx("div", {
					className: "space-y-3",
					children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }, i))
				}) : /* @__PURE__ */ jsx("div", {
					className: "divide-y divide-border",
					children: recent?.map((item) => {
						return /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 py-3",
							children: [
								/* @__PURE__ */ jsx(categoryIcons[item.category] ?? FileText, { className: "h-4 w-4 text-muted-foreground" }),
								/* @__PURE__ */ jsxs("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ jsx("p", {
										className: "truncate text-sm font-medium",
										children: item.title
									}), /* @__PURE__ */ jsxs("p", {
										className: "text-xs text-muted-foreground",
										children: [
											item.city,
											" · ",
											item.subCategory
										]
									})]
								}),
								/* @__PURE__ */ jsx(Badge, {
									variant: "secondary",
									className: statusColors[item.status] ?? "",
									children: item.status
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-xs text-muted-foreground",
									children: new Date(item.createdAt).toLocaleDateString()
								})
							]
						}, item.id);
					})
				}) })] })
			})
		]
	});
}
//#endregion
//#region src/routes/_admin/admin/index.tsx?tsr-split=component
var SplitComponent = DashboardPage;
//#endregion
export { SplitComponent as component };
