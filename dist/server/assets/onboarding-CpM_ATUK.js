import { a as refreshConnectStatusFn } from "./payments.fn-bZdLCV6M.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/_account/account/payments/onboarding.tsx?tsr-split=component
function OnboardingReturnPage() {
	const navigate = useNavigate();
	const [status, setStatus] = useState("loading");
	useEffect(() => {
		let mounted = true;
		refreshConnectStatusFn().then((res) => {
			if (!mounted) return;
			if (res.chargesEnabled && res.payoutsEnabled) setStatus("ready");
			else setStatus("incomplete");
		}).catch(() => mounted && setStatus("error"));
		return () => {
			mounted = false;
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg border bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900",
		children: [
			status === "loading" && /* @__PURE__ */ jsx("p", {
				className: "text-neutral-500",
				children: "Verifying with Stripe…"
			}),
			status === "ready" && /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold text-emerald-600",
					children: "Onboarding complete"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-neutral-500",
					children: "You can now accept payments on your listings."
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => navigate({ to: "/account/payments" }),
					className: "mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900",
					children: "Go to payments"
				})
			] }),
			status === "incomplete" && /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold text-amber-600",
					children: "Setup not finished"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-neutral-500",
					children: "Stripe still needs more information from you. You can resume from the payments page."
				}),
				/* @__PURE__ */ jsx(Link, {
					to: "/account/payments",
					className: "mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900",
					children: "Back to payments"
				})
			] }),
			status === "error" && /* @__PURE__ */ jsx("p", {
				className: "text-red-600",
				children: "Could not verify your account. Please refresh."
			})
		]
	});
}
//#endregion
export { OnboardingReturnPage as component };
