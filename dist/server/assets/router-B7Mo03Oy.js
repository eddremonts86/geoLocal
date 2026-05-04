import { t as getGlobalStartContext } from "./getGlobalStartContext-DX3SW4NI.js";
import { t as createServerFn } from "../server.js";
import { t as loadDb } from "./load-gagVjFt5.js";
import { p as payments, v as stripeEvents } from "./schema-Bm7YGE-a.js";
import { n as isClient } from "./utils-D2z7vV21.js";
import { t as getPublicEnvVariables } from "./env-lrErrSrj.js";
import "./dist-TPNQHynL.js";
import { r as sendPaymentReceiptEmail } from "./mailer-B0GfxoPd.js";
import { n as getStripe, r as getWebhookSecret } from "./stripe-BT_rw8Q4.js";
import { t as InternalClerkProvider } from "./internal-BvuRWgVR.js";
import { r as TooltipProvider } from "./tooltip-BJcKbcup.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { t as Route$31 } from "./u._handle-Di_Ki_8m.js";
import { t as Route$32 } from "./_slug-DDV_J8_2.js";
import { t as Route$33 } from "./new-CFo88vtt.js";
import { t as Route$34 } from "./_threadId-DknDG66P.js";
import { t as Route$35 } from "./_id-CSQcMhRJ.js";
import React, { useEffect, useTransition } from "react";
import { HeadContent, ScriptOnce, Scripts, createFileRoute, createRootRoute, createRouter as createRouter$1, lazyRouteComponent, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, domAnimation } from "framer-motion";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "i18next";
//#region src/shared/styles/globals.css?url
var globals_default = "/assets/globals-TmHJ0z-u.css";
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/client/OptionsContext.js
var ClerkOptionsCtx = React.createContext(void 0);
ClerkOptionsCtx.displayName = "ClerkOptionsCtx";
var ClerkOptionsProvider = (props) => {
	const { children, options } = props;
	return /* @__PURE__ */ jsx(ClerkOptionsCtx.Provider, {
		value: { value: options },
		children
	});
};
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/client/useAwaitableNavigate.js
var useAwaitableNavigate = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const resolveFunctionsRef = React.useRef([]);
	const resolveAll = () => {
		resolveFunctionsRef.current.forEach((resolve) => resolve());
		resolveFunctionsRef.current.splice(0, resolveFunctionsRef.current.length);
	};
	const [_, startTransition] = useTransition();
	React.useEffect(() => {
		resolveAll();
	}, [location]);
	return (options) => {
		return new Promise((res) => {
			startTransition(() => {
				resolveFunctionsRef.current.push(res);
				res(navigate(options));
			});
		});
	};
};
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/client/utils.js
var pickFromClerkInitState = (clerkInitState) => {
	const { __clerk_ssr_state, __publishableKey, __proxyUrl, __domain, __isSatellite, __signInUrl, __signUpUrl, __clerkJSUrl, __clerkJSVersion, __clerkUIUrl, __clerkUIVersion, __telemetryDisabled, __telemetryDebug, __signInForceRedirectUrl, __signUpForceRedirectUrl, __signInFallbackRedirectUrl, __signUpFallbackRedirectUrl, __keylessClaimUrl, __keylessApiKeysUrl, __prefetchUI } = clerkInitState || {};
	return {
		clerkSsrState: __clerk_ssr_state,
		publishableKey: __publishableKey,
		proxyUrl: __proxyUrl,
		domain: __domain,
		isSatellite: !!__isSatellite,
		signInUrl: __signInUrl,
		signUpUrl: __signUpUrl,
		__internal_clerkJSUrl: __clerkJSUrl,
		__internal_clerkJSVersion: __clerkJSVersion,
		__internal_clerkUIUrl: __clerkUIUrl,
		__internal_clerkUIVersion: __clerkUIVersion,
		prefetchUI: __prefetchUI,
		telemetry: {
			disabled: __telemetryDisabled,
			debug: __telemetryDebug
		},
		signInForceRedirectUrl: __signInForceRedirectUrl,
		signUpForceRedirectUrl: __signUpForceRedirectUrl,
		signInFallbackRedirectUrl: __signInFallbackRedirectUrl,
		signUpFallbackRedirectUrl: __signUpFallbackRedirectUrl,
		__keylessClaimUrl,
		__keylessApiKeysUrl
	};
};
var mergeWithPublicEnvs = (restInitState) => {
	const envVars = getPublicEnvVariables();
	return {
		...restInitState,
		publishableKey: restInitState.publishableKey || envVars.publishableKey,
		domain: restInitState.domain || envVars.domain,
		isSatellite: restInitState.isSatellite || envVars.isSatellite,
		signInUrl: restInitState.signInUrl || envVars.signInUrl,
		signUpUrl: restInitState.signUpUrl || envVars.signUpUrl,
		__internal_clerkJSUrl: restInitState.__internal_clerkJSUrl || envVars.clerkJsUrl,
		__internal_clerkJSVersion: restInitState.__internal_clerkJSVersion || envVars.clerkJsVersion,
		__internal_clerkUIUrl: restInitState.__internal_clerkUIUrl || envVars.clerkUIUrl,
		__internal_clerkUIVersion: restInitState.__internal_clerkUIVersion || envVars.clerkUIVersion,
		signInForceRedirectUrl: restInitState.signInForceRedirectUrl,
		prefetchUI: restInitState.prefetchUI ?? envVars.prefetchUI
	};
};
function parseUrlForNavigation(to, baseUrl) {
	const url = new URL(to, baseUrl);
	const searchParams = Object.fromEntries(url.searchParams);
	return {
		to: url.pathname,
		search: Object.keys(searchParams).length > 0 ? searchParams : void 0,
		hash: url.hash ? url.hash.slice(1) : void 0
	};
}
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/client/ClerkProvider.js
var SDK_METADATA = {
	name: "@clerk/tanstack-react-start",
	version: "1.1.3"
};
var awaitableNavigateRef = { current: void 0 };
function ClerkProvider({ children, ...providerProps }) {
	const awaitableNavigate = useAwaitableNavigate();
	const clerkInitialState = getGlobalStartContext()?.clerkInitialState ?? {};
	useEffect(() => {
		awaitableNavigateRef.current = awaitableNavigate;
	}, [awaitableNavigate]);
	const { clerkSsrState, __keylessClaimUrl, __keylessApiKeysUrl, ...restInitState } = pickFromClerkInitState((isClient() ? window.__clerk_init_state : clerkInitialState)?.__internal_clerk_state);
	const mergedProps = {
		...mergeWithPublicEnvs(restInitState),
		...providerProps
	};
	const keylessProps = __keylessClaimUrl ? {
		__internal_keyless_claimKeylessApplicationUrl: __keylessClaimUrl,
		__internal_keyless_copyInstanceKeysUrl: __keylessApiKeysUrl
	} : {};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(ScriptOnce, { children: `window.__clerk_init_state = ${JSON.stringify(clerkInitialState)};` }), /* @__PURE__ */ jsx(ClerkOptionsProvider, {
		options: mergedProps,
		children: /* @__PURE__ */ jsx(InternalClerkProvider, {
			initialState: clerkSsrState,
			sdkMetadata: SDK_METADATA,
			routerPush: (to) => {
				const { search, hash, ...rest } = parseUrlForNavigation(to, window.location.origin);
				return awaitableNavigateRef.current?.({
					...rest,
					search,
					hash,
					replace: false
				});
			},
			routerReplace: (to) => {
				const { search, hash, ...rest } = parseUrlForNavigation(to, window.location.origin);
				return awaitableNavigateRef.current?.({
					...rest,
					search,
					hash,
					replace: true
				});
			},
			...mergedProps,
			...keylessProps,
			children
		})
	})] });
}
ClerkProvider.displayName = "ClerkProvider";
i18n.use(initReactI18next).init({
	resources: {
		en: { translation: {
			nav: {
				"rent": "Rent",
				"sale": "Sale",
				"search": "Search properties...",
				"favorites": "Favorites",
				"profile": "Profile",
				"explore": "Explore",
				"properties": "Properties",
				"vehicles": "Vehicles",
				"services": "Services"
			},
			categories: {
				"properties": "Properties",
				"vehicles": "Vehicles",
				"services": "Services",
				"experiences": "Experiences"
			},
			footer: {
				"tagline": "Properties, vehicles, and services — discovered on the map of Copenhagen.",
				"explore": "Explore",
				"company": "Company",
				"legal": "Legal",
				"about": "About",
				"journal": "Journal",
				"press": "Press",
				"contact": "Contact",
				"privacy": "Privacy",
				"terms": "Terms",
				"cookies": "Cookies",
				"allRightsReserved": "All rights reserved"
			},
			editorial: {
				"city": "Copenhagen",
				"established": "Copenhagen · Est. 2026",
				"volume": "Vol. 01",
				"verticals": "01 · Verticals",
				"threeCategories": "Three categories",
				"thisWeek": "02 · This week",
				"discover": "Discover",
				"specification": "Specification",
				"price": "Price",
				"seeAll": "See all"
			},
			landing: {
				"hero": "What are you looking for?",
				"heroTitle": "What are you looking for?",
				"subtitle": "Discover properties, vehicles, and services near you in Copenhagen",
				"heroSubtitle": "Discover properties, vehicles, and services near you in Copenhagen",
				"properties": "Properties",
				"propertiesDesc": "Houses, apartments, offices and more",
				"categoryProperty": "Properties",
				"categoryPropertyDesc": "Houses, apartments, offices and more",
				"vehicles": "Vehicles",
				"vehiclesDesc": "Cars, motorcycles, boats and more",
				"categoryVehicle": "Vehicles",
				"categoryVehicleDesc": "Cars, motorcycles, boats and more",
				"services": "Services",
				"servicesDesc": "Home repair, cleaning, tutoring and more",
				"categoryService": "Services",
				"categoryServiceDesc": "Home repair, cleaning, tutoring and more",
				"hire": "Hire",
				"featured": "Featured Listings",
				"exploreAll": "Explore all"
			},
			explore: {
				"allCategories": "All",
				"properties": "Properties",
				"vehicles": "Vehicles",
				"services": "Services",
				"experiences": "Experiences",
				"results": "{{count}} results",
				"noResults": "No listings found",
				"adjustFilters": "Try adjusting your filters or search area",
				"loadMore": "Load more",
				"errorLoading": "Error loading listings",
				"buy": "Buy",
				"rent": "Rent",
				"hire": "Hire",
				"priceMin": "Min price",
				"priceMax": "Max price",
				"sort": "Sort",
				"popular": "Popular",
				"newest": "Newest",
				"priceAsc": "Price ↑",
				"priceDesc": "Price ↓"
			},
			filters: {
				"propertyType": "Property Type",
				"house": "House",
				"apartment": "Apartment",
				"condo": "Condo",
				"land": "Land Plot",
				"price": "Price",
				"priceRange": "Price Range",
				"bedrooms": "Bedrooms",
				"bathrooms": "Bathrooms",
				"area": "Area",
				"amenities": "Amenities",
				"sort": "Sort by",
				"popular": "Popular",
				"newest": "Newest",
				"priceAsc": "Price ↑",
				"priceDesc": "Price ↓",
				"showResults": "Show {{count}} results",
				"vehicleType": "Vehicle type",
				"subcat_car": "Car",
				"subcat_suv": "SUV",
				"subcat_motorcycle": "Motorcycle",
				"subcat_bicycle": "Bicycle",
				"subcat_boat": "Boat",
				"subcat_airplane": "Airplane",
				"subcat_commercial_vehicle": "Commercial",
				"subcat_truck": "Truck",
				"activeFilters": "{{count}} filters",
				"clearAll": "Clear all",
				"studio": "Studio",
				"rent": "Rent",
				"sale": "Buy",
				"beds": "bd",
				"moreFilters": "More filters",
				"make": "Make",
				"year": "Year",
				"fuelType": "Fuel Type",
				"transmission": "Transmission",
				"experience": "Experience",
				"experienceType": "Experience type",
				"duration": "Duration",
				"groupSize": "Group size",
				"guests": "guests",
				"min": "Min",
				"max": "Max",
				"type": "Type",
				"filters": "Filters",
				"years": "yrs"
			},
			listing: {
				"notFound": "Listing not found",
				"backToExplore": "Back to explore",
				"back": "Back",
				"description": "Description",
				"features": "Features",
				"contact": "Contact",
				"requestService": "Request Service",
				"bookTour": "Book a Tour"
			},
			property: {
				"beds": "Beds",
				"baths": "Baths",
				"area": "Area",
				"parking": "Parking",
				"perMonth": "/month",
				"perYear": "/year",
				"featured": "Featured",
				"bookTour": "Book a tour",
				"contact": "Contact",
				"seeMore": "See More",
				"seeLess": "See Less",
				"description": "Property details",
				"propertiesFound": "{{count}} properties found",
				"noResults": "No properties found",
				"tryAdjustingFilters": "Try adjusting your filters or search area",
				"errorLoading": "Could not load properties",
				"tryAgainLater": "Please check your connection and try again",
				"resultCount": "results",
				"resultCountWithNumber": "{{count}} results"
			},
			admin: {
				"dashboard": "Dashboard",
				"dashboardDesc": "Overview of your marketplace",
				"listings": "Listings",
				"scraping": "Scraped Items",
				"properties": "Properties",
				"vehicles": "Vehicles",
				"services": "Services",
				"settings": "Settings",
				"logout": "Log out",
				"help": "Help Center",
				"totalListings": "Total Listings",
				"published": "Published",
				"featured": "Featured",
				"recentListings": "Recent Listings",
				"viewAll": "View All",
				"newListing": "New Listing",
				"addProperty": "Add Property",
				"addVehicle": "Add Vehicle",
				"addService": "Add Service",
				"searchListings": "Search listings...",
				"saveDraft": "Save Draft",
				"createProperty": "Create Property",
				"editProperty": "Edit Property",
				"publish": "Publish",
				"unpublish": "Unpublish",
				"delete": "Delete",
				"draft": "Draft",
				"all": "All",
				"login": "Sign in",
				"email": "Email",
				"password": "Password"
			},
			common: {
				"loading": "Loading...",
				"error": "Something went wrong",
				"retry": "Retry",
				"noResults": "No listings match your filters",
				"save": "Save",
				"cancel": "Cancel",
				"confirm": "Confirm"
			}
		} },
		es: { translation: {
			nav: {
				"rent": "Renta",
				"sale": "Venta",
				"search": "Buscar propiedades...",
				"favorites": "Favoritos",
				"profile": "Perfil",
				"explore": "Explorar",
				"properties": "Inmuebles",
				"vehicles": "Vehículos",
				"services": "Servicios"
			},
			categories: {
				"properties": "Inmuebles",
				"vehicles": "Vehículos",
				"services": "Servicios",
				"experiences": "Experiencias"
			},
			footer: {
				"tagline": "Inmuebles, vehículos y servicios — descubiertos en el mapa de Copenhague.",
				"explore": "Explorar",
				"company": "Compañía",
				"legal": "Legal",
				"about": "Acerca de",
				"journal": "Bitácora",
				"press": "Prensa",
				"contact": "Contacto",
				"privacy": "Privacidad",
				"terms": "Términos",
				"cookies": "Cookies",
				"allRightsReserved": "Todos los derechos reservados"
			},
			editorial: {
				"city": "Copenhague",
				"established": "Copenhague · Est. 2026",
				"volume": "Vol. 01",
				"verticals": "01 · Verticales",
				"threeCategories": "Tres categorías",
				"thisWeek": "02 · Esta semana",
				"discover": "Descubrir",
				"specification": "Especificaciones",
				"price": "Precio",
				"seeAll": "Ver todo"
			},
			landing: {
				"hero": "¿Qué estás buscando?",
				"heroTitle": "¿Qué estás buscando?",
				"subtitle": "Descubre inmuebles, vehículos y servicios cerca de ti en Copenhague",
				"heroSubtitle": "Descubre inmuebles, vehículos y servicios cerca de ti en Copenhague",
				"properties": "Inmuebles",
				"propertiesDesc": "Casas, departamentos, oficinas y más",
				"categoryProperty": "Inmuebles",
				"categoryPropertyDesc": "Casas, departamentos, oficinas y más",
				"vehicles": "Vehículos",
				"vehiclesDesc": "Autos, motos, botes y más",
				"categoryVehicle": "Vehículos",
				"categoryVehicleDesc": "Autos, motos, botes y más",
				"services": "Servicios",
				"servicesDesc": "Reparaciones, limpieza, tutorías y más",
				"categoryService": "Servicios",
				"categoryServiceDesc": "Reparaciones, limpieza, tutorías y más",
				"hire": "Contratar",
				"featured": "Listados Destacados",
				"exploreAll": "Explorar todo"
			},
			explore: {
				"allCategories": "Todos",
				"properties": "Inmuebles",
				"vehicles": "Vehículos",
				"services": "Servicios",
				"experiences": "Experiencias",
				"results": "{{count}} resultados",
				"noResults": "No se encontraron listados",
				"adjustFilters": "Intenta ajustar tus filtros o área de búsqueda",
				"loadMore": "Cargar más",
				"errorLoading": "Error al cargar listados",
				"buy": "Comprar",
				"rent": "Rentar",
				"hire": "Contratar",
				"priceMin": "Precio mín",
				"priceMax": "Precio máx",
				"sort": "Ordenar",
				"popular": "Popular",
				"newest": "Más reciente",
				"priceAsc": "Precio ↑",
				"priceDesc": "Precio ↓"
			},
			filters: {
				"propertyType": "Tipo de propiedad",
				"house": "Casa",
				"apartment": "Apartamento",
				"condo": "Condominio",
				"land": "Terreno",
				"price": "Precio",
				"priceRange": "Rango de precio",
				"bedrooms": "Habitaciones",
				"bathrooms": "Baños",
				"area": "Área",
				"amenities": "Amenidades",
				"sort": "Ordenar por",
				"popular": "Popular",
				"newest": "Más reciente",
				"priceAsc": "Precio ↑",
				"priceDesc": "Precio ↓",
				"showResults": "Mostrar {{count}} resultados",
				"vehicleType": "Tipo de vehículo",
				"subcat_car": "Auto",
				"subcat_suv": "SUV",
				"subcat_motorcycle": "Moto",
				"subcat_bicycle": "Bicicleta",
				"subcat_boat": "Bote",
				"subcat_airplane": "Avión",
				"subcat_commercial_vehicle": "Comercial",
				"subcat_truck": "Camión",
				"activeFilters": "{{count}} filtros",
				"clearAll": "Limpiar todo",
				"studio": "Estudio",
				"rent": "Renta",
				"sale": "Compra",
				"beds": "hab",
				"moreFilters": "Más filtros",
				"make": "Marca",
				"year": "Año",
				"fuelType": "Combustible",
				"transmission": "Transmisión",
				"experience": "Experiencia"
			},
			listing: {
				"notFound": "Listado no encontrado",
				"backToExplore": "Volver a explorar",
				"back": "Volver",
				"description": "Descripción",
				"features": "Características",
				"contact": "Contactar",
				"requestService": "Solicitar Servicio",
				"bookTour": "Agendar Visita"
			},
			property: {
				"beds": "Hab.",
				"baths": "Baños",
				"area": "Área",
				"parking": "Parking",
				"perMonth": "/mes",
				"perYear": "/año",
				"featured": "Destacado",
				"bookTour": "Agendar visita",
				"contact": "Contactar",
				"seeMore": "Ver más",
				"seeLess": "Ver menos",
				"description": "Detalles de la propiedad",
				"propertiesFound": "{{count}} propiedades encontradas",
				"noResults": "No se encontraron propiedades",
				"tryAdjustingFilters": "Intenta ajustar tus filtros o área de búsqueda",
				"errorLoading": "No se pudieron cargar las propiedades",
				"tryAgainLater": "Verifica tu conexión e intenta de nuevo",
				"resultCount": "resultados",
				"resultCountWithNumber": "{{count}} resultados"
			},
			admin: {
				"dashboard": "Panel",
				"dashboardDesc": "Resumen de tu marketplace",
				"listings": "Listados",
				"scraping": "Ítems Scrapeados",
				"properties": "Inmuebles",
				"vehicles": "Vehículos",
				"services": "Servicios",
				"settings": "Configuración",
				"logout": "Cerrar sesión",
				"help": "Centro de ayuda",
				"totalListings": "Total Listados",
				"published": "Publicados",
				"featured": "Destacados",
				"recentListings": "Listados Recientes",
				"viewAll": "Ver Todo",
				"newListing": "Nuevo Listado",
				"addProperty": "Agregar Inmueble",
				"addVehicle": "Agregar Vehículo",
				"addService": "Agregar Servicio",
				"searchListings": "Buscar listados...",
				"saveDraft": "Guardar Borrador",
				"createProperty": "Crear propiedad",
				"editProperty": "Editar propiedad",
				"publish": "Publicar",
				"unpublish": "Despublicar",
				"delete": "Eliminar",
				"draft": "Borrador",
				"all": "Todos",
				"login": "Iniciar sesión",
				"email": "Correo electrónico",
				"password": "Contraseña"
			},
			common: {
				"loading": "Cargando...",
				"error": "Algo salió mal",
				"retry": "Reintentar",
				"noResults": "No hay listados que coincidan con tus filtros",
				"save": "Guardar",
				"cancel": "Cancelar",
				"confirm": "Confirmar"
			}
		} }
	},
	lng: "en",
	fallbackLng: "en",
	supportedLngs: ["en", "es"],
	interpolation: { escapeValue: false }
});
var STORAGE_KEY = "geo-dashboard-lang";
/** Detect stored/browser language AFTER hydration to avoid SSR mismatch. */
function useLanguageSync() {
	useEffect(() => {
		const detected = localStorage.getItem(STORAGE_KEY) ?? (navigator.language?.startsWith("es") ? "es" : "en");
		if (detected !== i18n.language) i18n.changeLanguage(detected);
		const handler = (lng) => localStorage.setItem(STORAGE_KEY, lng);
		i18n.on("languageChanged", handler);
		return () => {
			i18n.off("languageChanged", handler);
		};
	}, []);
}
//#endregion
//#region src/shared/providers/index.tsx
var queryClient = new QueryClient({ defaultOptions: { queries: {
	staleTime: 1e3 * 60,
	retry: 1
} } });
function AppProviders({ children }) {
	useLanguageSync();
	return /* @__PURE__ */ jsx(NuqsAdapter, { children: /* @__PURE__ */ jsx(LazyMotion, {
		features: domAnimation,
		children: /* @__PURE__ */ jsx(I18nextProvider, {
			i18n,
			children: /* @__PURE__ */ jsx(QueryClientProvider, {
				client: queryClient,
				children: /* @__PURE__ */ jsx(TooltipProvider, { children })
			})
		})
	}) });
}
//#endregion
//#region src/routes/-root-components.tsx
var themeScript = `(function(){try{var t=localStorage.getItem('geolocal-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();`;
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ jsxs("head", { children: [/* @__PURE__ */ jsx(HeadContent, {}), /* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: themeScript } })] }), /* @__PURE__ */ jsxs("body", {
			className: "min-h-screen bg-background font-sans antialiased",
			suppressHydrationWarning: true,
			children: [/* @__PURE__ */ jsx(ClerkProvider, { children: /* @__PURE__ */ jsx(AppProviders, { children }) }), /* @__PURE__ */ jsx(Scripts, {})]
		})]
	});
}
//#endregion
//#region src/routes/__root.tsx
var Route$30 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "GeoLocal — Copenhagen Marketplace" },
			{
				name: "description",
				content: "Properties, vehicles, and services — discovered on the map of Copenhagen."
			},
			{
				name: "theme-color",
				content: "#f7f3ea"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: globals_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,200..900,0..100,0..1;1,9..144,200..900,0..100,0..1&family=Geist:wght@300..700&family=JetBrains+Mono:wght@400;500;600&display=swap"
			}
		]
	}),
	shellComponent: RootDocument
});
//#endregion
//#region src/routes/sign-in.tsx
var $$splitComponentImporter$28 = () => import("./sign-in-BWf8_SZU.js");
var Route$29 = createFileRoute("/sign-in")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
//#endregion
//#region src/routes/_public/route.tsx
var $$splitComponentImporter$27 = () => import("./route-Dw15M1y_.js");
var Route$28 = createFileRoute("/_public")({ component: lazyRouteComponent($$splitComponentImporter$27, "component") });
/**
* Pathnames that own their scroll state (split-view / map pages).
* We do NOT force scroll-to-top on these — they manage their own panes.
*/
//#endregion
//#region src/routes/_admin/route.tsx
var $$splitComponentImporter$26 = () => import("./route-DWvnUm6s.js");
var requireAdmin = createServerFn().handler(createSsrRpc("3fbb17efe26a17757945ced5a774577f93ccd1715634bd638fad4336a0ca15e9"));
var Route$27 = createFileRoute("/_admin")({
	beforeLoad: async () => {
		await requireAdmin();
	},
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
//#endregion
//#region src/routes/_account/route.tsx
var $$splitComponentImporter$25 = () => import("./route-C0G6A-0l.js");
var requireAuth = createServerFn().handler(createSsrRpc("e7ab81fb5a75a55cf6ceeb4c559f1bb7b985085fc524baa6c21c601db3ba9328"));
var Route$26 = createFileRoute("/_account")({
	beforeLoad: async () => {
		await requireAuth();
	},
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
//#endregion
//#region src/routes/_public/index.tsx
var $$splitComponentImporter$24 = () => import("./_public-CKNzdfJc.js");
var Route$25 = createFileRoute("/_public/")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
//#endregion
//#region src/routes/_public/terms.tsx
var $$splitComponentImporter$23 = () => import("./terms-Cth0hIpC.js");
var Route$24 = createFileRoute("/_public/terms")({ component: lazyRouteComponent($$splitComponentImporter$23, "component") });
//#endregion
//#region src/routes/_public/privacy.tsx
var $$splitComponentImporter$22 = () => import("./privacy-CjWOpfm4.js");
var Route$23 = createFileRoute("/_public/privacy")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
//#endregion
//#region src/routes/_public/press.tsx
var $$splitComponentImporter$21 = () => import("./press-BPZrDQ58.js");
var Route$22 = createFileRoute("/_public/press")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
//#endregion
//#region src/routes/_public/journal.tsx
var $$splitComponentImporter$20 = () => import("./journal-CeHXd0TR.js");
var Route$21 = createFileRoute("/_public/journal")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
//#endregion
//#region src/routes/_public/favorites.tsx
var $$splitComponentImporter$19 = () => import("./favorites-ClOKoJiJ.js");
var Route$20 = createFileRoute("/_public/favorites")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
//#endregion
//#region src/routes/_public/explore.tsx
var $$splitComponentImporter$18 = () => import("./explore-CkIMEo-Z.js");
var Route$19 = createFileRoute("/_public/explore")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
//#endregion
//#region src/routes/_public/cookies.tsx
var $$splitComponentImporter$17 = () => import("./cookies-ZwDfxYzK.js");
var Route$18 = createFileRoute("/_public/cookies")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
//#endregion
//#region src/routes/_public/contact.tsx
var $$splitComponentImporter$16 = () => import("./contact-BmMwSlpP.js");
var Route$17 = createFileRoute("/_public/contact")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
//#endregion
//#region src/routes/_public/about.tsx
var $$splitComponentImporter$15 = () => import("./about-BcxZ5dqU.js");
var Route$16 = createFileRoute("/_public/about")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
//#endregion
//#region src/routes/_admin/admin/index.tsx
var $$splitComponentImporter$14 = () => import("./admin-4y-ZFDdK.js");
var Route$15 = createFileRoute("/_admin/admin/")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
//#endregion
//#region src/routes/_account/account/index.tsx
var $$splitComponentImporter$13 = () => import("./account-Br0fOETj.js");
var Route$14 = createFileRoute("/_account/account/")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
//#endregion
//#region src/routes/api.stripe.webhook.ts
/**
* Stripe webhook handler.
*
* Stripe POSTs JSON events here with a `stripe-signature` header. We:
*  1. read the raw body (NEVER pre-parse — the signature covers raw bytes)
*  2. verify the signature with `STRIPE_WEBHOOK_SECRET`
*  3. record the event in `stripe_events` (idempotency: PK = stripe id)
*  4. fan out side-effects per event type
*
* Errors return a 400 — Stripe will retry. We treat already-processed events
* as success (200) to stop retries.
*/
var Route$13 = createFileRoute("/api/stripe/webhook")({ server: { handlers: { POST: async ({ request }) => {
	const sig = request.headers.get("stripe-signature");
	if (!sig) return new Response("Missing signature", { status: 400 });
	const stripe = getStripe();
	const secret = getWebhookSecret();
	const raw = await request.text();
	let event;
	try {
		event = stripe.webhooks.constructEvent(raw, sig, secret);
	} catch (err) {
		return new Response(`Bad signature: ${err.message}`, { status: 400 });
	}
	const db = await loadDb();
	if ((await db.insert(stripeEvents).values({
		id: event.id,
		type: event.type,
		payload: event
	}).onConflictDoNothing({ target: stripeEvents.id }).returning({ id: stripeEvents.id })).length === 0) return new Response("Already processed", { status: 200 });
	try {
		await dispatchStripeEvent(event);
		await db.update(stripeEvents).set({ processedAt: /* @__PURE__ */ new Date() }).where(eq(stripeEvents.id, event.id));
		return new Response("ok", { status: 200 });
	} catch (err) {
		await db.update(stripeEvents).set({ error: err.message }).where(eq(stripeEvents.id, event.id));
		return new Response("error", { status: 500 });
	}
} } } });
async function dispatchStripeEvent(event) {
	const db = await loadDb();
	switch (event.type) {
		case "payment_intent.succeeded": {
			const pi = event.data.object;
			const updated = await db.update(payments).set({
				status: "succeeded",
				stripeChargeId: pi.latest_charge ?? null,
				paidAt: /* @__PURE__ */ new Date(),
				updatedAt: /* @__PURE__ */ new Date()
			}).where(eq(payments.stripePaymentIntentId, pi.id)).returning({
				id: payments.id,
				buyerId: payments.buyerId,
				sellerId: payments.sellerId,
				amount: payments.amountTotal,
				currency: payments.currency
			});
			if (updated[0]) {
				const row = updated[0];
				sendPaymentReceiptEmail({
					recipientUserId: row.buyerId,
					paymentId: row.id,
					amount: row.amount,
					currency: row.currency
				});
			}
			return;
		}
		case "payment_intent.payment_failed": {
			const pi = event.data.object;
			await db.update(payments).set({
				status: "failed",
				failedAt: /* @__PURE__ */ new Date(),
				metadata: { error: pi.last_payment_error?.message ?? null },
				updatedAt: /* @__PURE__ */ new Date()
			}).where(eq(payments.stripePaymentIntentId, pi.id));
			return;
		}
		case "charge.refunded": {
			const ch = event.data.object;
			await db.update(payments).set({
				status: "refunded",
				refundedAt: /* @__PURE__ */ new Date(),
				updatedAt: /* @__PURE__ */ new Date()
			}).where(eq(payments.stripePaymentIntentId, ch.payment_intent));
			return;
		}
		case "account.updated": return;
		default: return;
	}
}
//#endregion
//#region src/routes/_admin/admin/users.tsx
/**
* Admin → users.
*
* Lists known user_profiles rows (anyone who has signed in at least once) and
* lets admins ban / unban accounts. Banning is delegated to `banUserFn`, which
* also archives all of the user's listings.
*/
var $$splitComponentImporter$12 = () => import("./users-U5j0x-x-.js");
var Route$12 = createFileRoute("/_admin/admin/users")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
//#endregion
//#region src/routes/_admin/admin/reports.tsx
var $$splitComponentImporter$11 = () => import("./reports-BTT1ysrw.js");
var Route$11 = createFileRoute("/_admin/admin/reports")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
//#endregion
//#region src/routes/_admin/admin/login.tsx
var $$splitComponentImporter$10 = () => import("./login-Bj10JAdX.js");
var Route$10 = createFileRoute("/_admin/admin/login")({
	beforeLoad: () => {
		throw redirect({
			to: "/sign-in",
			replace: true
		});
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
//#endregion
//#region src/routes/_account/account/profile.tsx
var $$splitComponentImporter$9 = () => import("./profile-CW_71W_B.js");
var Route$9 = createFileRoute("/_account/account/profile")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
//#endregion
//#region src/routes/_admin/admin/scraping/index.tsx
var $$splitComponentImporter$8 = () => import("./scraping-qypympw_.js");
var Route$8 = createFileRoute("/_admin/admin/scraping/")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
//#endregion
//#region src/routes/_admin/admin/listings/index.tsx
var $$splitComponentImporter$7 = () => import("./listings-CRj5c05f.js");
var Route$7 = createFileRoute("/_admin/admin/listings/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
//#endregion
//#region src/routes/_account/account/payments/index.tsx
var $$splitComponentImporter$6 = () => import("./payments-BA3EJnLN.js");
var Route$6 = createFileRoute("/_account/account/payments/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
//#endregion
//#region src/routes/_account/account/messages/index.tsx
var $$splitComponentImporter$5 = () => import("./messages-Z0aDF-4g.js");
var Route$5 = createFileRoute("/_account/account/messages/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
//#endregion
//#region src/routes/_account/account/listings/index.tsx
var $$splitComponentImporter$4 = () => import("./listings-DAgamPq7.js");
var Route$4 = createFileRoute("/_account/account/listings/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
//#endregion
//#region src/routes/_admin/admin/scraping/sources.tsx
var $$splitComponentImporter$3 = () => import("./sources-sWhxuigd.js");
var searchSchema = z.object({ tab: z.enum(["discovery", "active"]).optional() });
var Route$3 = createFileRoute("/_admin/admin/scraping/sources")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	validateSearch: searchSchema
});
//#endregion
//#region src/routes/_admin/admin/listings/$id.tsx
var $$splitComponentImporter$2 = () => import("./_id-Ck6QCIvj.js");
var Route$2 = createFileRoute("/_admin/admin/listings/$id")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
//#endregion
//#region src/routes/_account/account/payments/onboarding.tsx
var $$splitComponentImporter$1 = () => import("./onboarding-CpM_ATUK.js");
var Route$1 = createFileRoute("/_account/account/payments/onboarding")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
//#endregion
//#region src/routes/_account/account/listings/new.tsx
var $$splitComponentImporter = () => import("./new-hsDcbqb4.js");
var Route = createFileRoute("/_account/account/listings/new")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
//#endregion
//#region src/routeTree.gen.ts
var SignInRoute = Route$29.update({
	id: "/sign-in",
	path: "/sign-in",
	getParentRoute: () => Route$30
});
var PublicRouteRoute = Route$28.update({
	id: "/_public",
	getParentRoute: () => Route$30
});
var AdminRouteRoute = Route$27.update({
	id: "/_admin",
	getParentRoute: () => Route$30
});
var AccountRouteRoute = Route$26.update({
	id: "/_account",
	getParentRoute: () => Route$30
});
var PublicIndexRoute = Route$25.update({
	id: "/",
	path: "/",
	getParentRoute: () => PublicRouteRoute
});
var PublicTermsRoute = Route$24.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => PublicRouteRoute
});
var PublicPrivacyRoute = Route$23.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => PublicRouteRoute
});
var PublicPressRoute = Route$22.update({
	id: "/press",
	path: "/press",
	getParentRoute: () => PublicRouteRoute
});
var PublicJournalRoute = Route$21.update({
	id: "/journal",
	path: "/journal",
	getParentRoute: () => PublicRouteRoute
});
var PublicFavoritesRoute = Route$20.update({
	id: "/favorites",
	path: "/favorites",
	getParentRoute: () => PublicRouteRoute
});
var PublicExploreRoute = Route$19.update({
	id: "/explore",
	path: "/explore",
	getParentRoute: () => PublicRouteRoute
});
var PublicCookiesRoute = Route$18.update({
	id: "/cookies",
	path: "/cookies",
	getParentRoute: () => PublicRouteRoute
});
var PublicContactRoute = Route$17.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => PublicRouteRoute
});
var PublicAboutRoute = Route$16.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => PublicRouteRoute
});
var AdminAdminIndexRoute = Route$15.update({
	id: "/admin/",
	path: "/admin/",
	getParentRoute: () => AdminRouteRoute
});
var AccountAccountIndexRoute = Route$14.update({
	id: "/account/",
	path: "/account/",
	getParentRoute: () => AccountRouteRoute
});
var ApiStripeWebhookRoute = Route$13.update({
	id: "/api/stripe/webhook",
	path: "/api/stripe/webhook",
	getParentRoute: () => Route$30
});
var PublicUHandleRoute = Route$31.update({
	id: "/u/$handle",
	path: "/u/$handle",
	getParentRoute: () => PublicRouteRoute
});
var PublicListingSlugRoute = Route$32.update({
	id: "/listing/$slug",
	path: "/listing/$slug",
	getParentRoute: () => PublicRouteRoute
});
var AdminAdminUsersRoute = Route$12.update({
	id: "/admin/users",
	path: "/admin/users",
	getParentRoute: () => AdminRouteRoute
});
var AdminAdminReportsRoute = Route$11.update({
	id: "/admin/reports",
	path: "/admin/reports",
	getParentRoute: () => AdminRouteRoute
});
var AdminAdminLoginRoute = Route$10.update({
	id: "/admin/login",
	path: "/admin/login",
	getParentRoute: () => AdminRouteRoute
});
var AccountAccountProfileRoute = Route$9.update({
	id: "/account/profile",
	path: "/account/profile",
	getParentRoute: () => AccountRouteRoute
});
var AdminAdminScrapingIndexRoute = Route$8.update({
	id: "/admin/scraping/",
	path: "/admin/scraping/",
	getParentRoute: () => AdminRouteRoute
});
var AdminAdminListingsIndexRoute = Route$7.update({
	id: "/admin/listings/",
	path: "/admin/listings/",
	getParentRoute: () => AdminRouteRoute
});
var AccountAccountPaymentsIndexRoute = Route$6.update({
	id: "/account/payments/",
	path: "/account/payments/",
	getParentRoute: () => AccountRouteRoute
});
var AccountAccountMessagesIndexRoute = Route$5.update({
	id: "/account/messages/",
	path: "/account/messages/",
	getParentRoute: () => AccountRouteRoute
});
var AccountAccountListingsIndexRoute = Route$4.update({
	id: "/account/listings/",
	path: "/account/listings/",
	getParentRoute: () => AccountRouteRoute
});
var AdminAdminScrapingSourcesRoute = Route$3.update({
	id: "/admin/scraping/sources",
	path: "/admin/scraping/sources",
	getParentRoute: () => AdminRouteRoute
});
var AdminAdminListingsNewRoute = Route$33.update({
	id: "/admin/listings/new",
	path: "/admin/listings/new",
	getParentRoute: () => AdminRouteRoute
});
var AdminAdminListingsIdRoute = Route$2.update({
	id: "/admin/listings/$id",
	path: "/admin/listings/$id",
	getParentRoute: () => AdminRouteRoute
});
var AccountAccountPaymentsOnboardingRoute = Route$1.update({
	id: "/account/payments/onboarding",
	path: "/account/payments/onboarding",
	getParentRoute: () => AccountRouteRoute
});
var AccountAccountMessagesThreadIdRoute = Route$34.update({
	id: "/account/messages/$threadId",
	path: "/account/messages/$threadId",
	getParentRoute: () => AccountRouteRoute
});
var AccountAccountListingsNewRoute = Route.update({
	id: "/account/listings/new",
	path: "/account/listings/new",
	getParentRoute: () => AccountRouteRoute
});
var AccountRouteRouteChildren = {
	AccountAccountProfileRoute,
	AccountAccountIndexRoute,
	AccountAccountListingsIdRoute: Route$35.update({
		id: "/account/listings/$id",
		path: "/account/listings/$id",
		getParentRoute: () => AccountRouteRoute
	}),
	AccountAccountListingsNewRoute,
	AccountAccountMessagesThreadIdRoute,
	AccountAccountPaymentsOnboardingRoute,
	AccountAccountListingsIndexRoute,
	AccountAccountMessagesIndexRoute,
	AccountAccountPaymentsIndexRoute
};
var AccountRouteRouteWithChildren = AccountRouteRoute._addFileChildren(AccountRouteRouteChildren);
var AdminRouteRouteChildren = {
	AdminAdminLoginRoute,
	AdminAdminReportsRoute,
	AdminAdminUsersRoute,
	AdminAdminIndexRoute,
	AdminAdminListingsIdRoute,
	AdminAdminListingsNewRoute,
	AdminAdminScrapingSourcesRoute,
	AdminAdminListingsIndexRoute,
	AdminAdminScrapingIndexRoute
};
var AdminRouteRouteWithChildren = AdminRouteRoute._addFileChildren(AdminRouteRouteChildren);
var PublicRouteRouteChildren = {
	PublicAboutRoute,
	PublicContactRoute,
	PublicCookiesRoute,
	PublicExploreRoute,
	PublicFavoritesRoute,
	PublicJournalRoute,
	PublicPressRoute,
	PublicPrivacyRoute,
	PublicTermsRoute,
	PublicIndexRoute,
	PublicListingSlugRoute,
	PublicUHandleRoute
};
var rootRouteChildren = {
	AccountRouteRoute: AccountRouteRouteWithChildren,
	AdminRouteRoute: AdminRouteRouteWithChildren,
	PublicRouteRoute: PublicRouteRoute._addFileChildren(PublicRouteRouteChildren),
	SignInRoute,
	ApiStripeWebhookRoute
};
var routeTree = Route$30._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	return createRouter$1({
		routeTree,
		context: {},
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
var createRouter = getRouter;
//#endregion
export { createRouter, getRouter };
