import { i as listMyPaymentsFn, r as getPayoutSummaryFn, t as createConnectOnboardingFn } from "./payments.fn-bZdLCV6M.js";
import { t as getMyProfileFn } from "./profile.fn--lv7pBGP.js";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery } from "@tanstack/react-query";
//#region src/routes/_account/account/payments/index.tsx?tsr-split=component
function PaymentsPage() {
	const profile = useQuery({
		queryKey: ["my-profile"],
		queryFn: () => getMyProfileFn()
	});
	const buyer = useQuery({
		queryKey: ["my-payments", "buyer"],
		queryFn: () => listMyPaymentsFn({ data: { side: "buyer" } })
	});
	const seller = useQuery({
		queryKey: ["my-payments", "seller"],
		queryFn: () => listMyPaymentsFn({ data: { side: "seller" } })
	});
	const payout = useQuery({
		queryKey: ["payout-summary"],
		queryFn: () => getPayoutSummaryFn(),
		enabled: Boolean(profile.data?.stripeAccountId)
	});
	const onboard = useMutation({
		mutationFn: () => createConnectOnboardingFn(),
		onSuccess: (res) => {
			window.location.href = res.url;
		}
	});
	const onboarded = Boolean(profile.data?.stripeChargesEnabled);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-semibold",
				children: "Payments"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-neutral-500",
				children: "Take payments for your listings via Stripe Connect."
			})] }),
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-2 font-medium",
					children: "Seller account"
				}), !profile.data?.stripeAccountId ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", {
					className: "mb-4 text-sm text-neutral-500",
					children: "You haven’t connected a payout account yet. Connect with Stripe to start accepting payments."
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => onboard.mutate(),
					disabled: onboard.isPending,
					className: "rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50",
					children: onboard.isPending ? "Loading…" : "Connect with Stripe"
				})] }) : !onboarded ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", {
					className: "mb-4 text-sm text-amber-600",
					children: "Account created but not fully onboarded. Finish setup with Stripe to start receiving payments."
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => onboard.mutate(),
					className: "rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700",
					children: "Continue onboarding"
				})] }) : /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 gap-4",
					children: [/* @__PURE__ */ jsx(Stat, {
						label: "Available",
						value: fmtBalance(payout.data?.available)
					}), /* @__PURE__ */ jsx(Stat, {
						label: "Pending",
						value: fmtBalance(payout.data?.pending)
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "grid grid-cols-1 gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ jsx(Table, {
					title: "As seller",
					rows: seller.data ?? []
				}), /* @__PURE__ */ jsx(Table, {
					title: "As buyer",
					rows: buyer.data ?? []
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-xs text-neutral-500",
				children: /* @__PURE__ */ jsx(Link, {
					to: "/account/payments/onboarding",
					className: "underline",
					children: "Refresh onboarding status →"
				})
			})
		]
	});
}
function fmtBalance(items) {
	if (!items || items.length === 0) return "—";
	return items.map((b) => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`).join(" · ");
}
function Stat({ label, value }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
		className: "text-xs uppercase tracking-wider text-neutral-500",
		children: label
	}), /* @__PURE__ */ jsx("div", {
		className: "mt-1 text-lg font-semibold",
		children: value
	})] });
}
function Table({ title, rows }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "border-b px-4 py-3 text-sm font-medium dark:border-neutral-800",
			children: title
		}), /* @__PURE__ */ jsxs("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ jsx("thead", {
				className: "border-b text-left text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800",
				children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-2",
						children: "Amount"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-2",
						children: "Intent"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-2",
						children: "Status"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-2",
						children: "Date"
					})
				] })
			}), /* @__PURE__ */ jsxs("tbody", { children: [rows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
				colSpan: 4,
				className: "px-4 py-8 text-center text-neutral-500",
				children: "Nothing here yet."
			}) }), rows.map((r) => /* @__PURE__ */ jsxs("tr", {
				className: "border-b last:border-b-0 dark:border-neutral-800",
				children: [
					/* @__PURE__ */ jsxs("td", {
						className: "px-4 py-2 font-medium",
						children: [
							(r.amountTotal / 100).toFixed(2),
							" ",
							r.currency
						]
					}),
					/* @__PURE__ */ jsx("td", {
						className: "px-4 py-2 text-neutral-500",
						children: r.intent
					}),
					/* @__PURE__ */ jsx("td", {
						className: "px-4 py-2 text-neutral-500",
						children: r.status
					}),
					/* @__PURE__ */ jsx("td", {
						className: "px-4 py-2 text-neutral-500",
						children: new Date(r.createdAt).toLocaleDateString()
					})
				]
			}, r.id))] })]
		})]
	});
}
//#endregion
export { PaymentsPage as component };
