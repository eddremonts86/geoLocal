import { useCallback, useEffect, useState } from "react";
//#region src/modules/shared/hooks/useTheme.ts
var STORAGE_KEY = "geolocal-theme";
function getSystemTheme() {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function readInitialTheme() {
	if (typeof window === "undefined") return "system";
	return localStorage.getItem(STORAGE_KEY) ?? "system";
}
function applyTheme(theme) {
	if (typeof document === "undefined") return;
	const resolved = theme === "system" ? getSystemTheme() : theme;
	document.documentElement.classList.toggle("dark", resolved === "dark");
}
var listeners = /* @__PURE__ */ new Set();
var currentTheme = typeof window === "undefined" ? "system" : readInitialTheme();
function setGlobalTheme(next) {
	currentTheme = next;
	applyTheme(next);
	if (typeof window !== "undefined") try {
		localStorage.setItem(STORAGE_KEY, next);
	} catch {}
	listeners.forEach((fn) => fn(next));
}
if (typeof window !== "undefined") applyTheme(currentTheme);
function useTheme() {
	const [theme, setThemeLocal] = useState(currentTheme);
	useEffect(() => {
		const fn = (t) => setThemeLocal(t);
		listeners.add(fn);
		if (currentTheme !== theme) setThemeLocal(currentTheme);
		return () => {
			listeners.delete(fn);
		};
	}, []);
	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => {
			if (currentTheme === "system") {
				applyTheme("system");
				listeners.forEach((fn) => fn("system"));
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);
	return {
		theme,
		setTheme: useCallback((newTheme) => {
			setGlobalTheme(newTheme);
		}, []),
		resolvedTheme: theme === "system" ? getSystemTheme() : theme
	};
}
//#endregion
export { useTheme as t };
