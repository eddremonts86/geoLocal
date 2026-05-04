import { t as Button } from "./button-D7roF92S.js";
import { t as useTheme } from "./useTheme-DhaMcgB6.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Globe, Moon, Sun } from "lucide-react";
//#region src/modules/shared/ui/ThemeToggle.tsx
function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	return /* @__PURE__ */ jsx(Button, {
		variant: "ghost",
		size: "icon",
		onClick: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
		"aria-label": resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
		className: "relative h-9 w-9",
		children: /* @__PURE__ */ jsx(m.div, {
			initial: {
				scale: .5,
				opacity: 0,
				rotate: -90
			},
			animate: {
				scale: 1,
				opacity: 1,
				rotate: 0
			},
			transition: {
				type: "spring",
				stiffness: 300,
				damping: 20
			},
			children: resolvedTheme === "dark" ? /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" })
		}, resolvedTheme)
	});
}
//#endregion
//#region src/modules/shared/ui/LanguageSwitcher.tsx
function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	const currentLang = mounted ? i18n.language : "en";
	const nextLang = currentLang === "es" ? "en" : "es";
	return /* @__PURE__ */ jsxs(Button, {
		variant: "ghost",
		size: "sm",
		onClick: () => i18n.changeLanguage(nextLang),
		"aria-label": `Switch to ${nextLang === "es" ? "Spanish" : "English"}`,
		className: "gap-1.5 text-muted",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", {
			className: "text-xs font-medium uppercase",
			suppressHydrationWarning: true,
			children: currentLang
		})]
	});
}
//#endregion
export { ThemeToggle as n, LanguageSwitcher as t };
