import { t as getGlobalStartContext } from "./getGlobalStartContext-DX3SW4NI.js";
import { t as createServerFn } from "../server.js";
import "./dist-DJ3cNMEy.js";
import { t as InternalClerkProvider } from "./internal-DlNqz25y.js";
import { n as isClient } from "./utils-BGQUucrf.js";
import { t as getPublicEnvVariables } from "./env-KsKcWIS6.js";
import { r as TooltipProvider } from "./tooltip-DDd0DgHJ.js";
import { t as createSsrRpc } from "./createSsrRpc-CoTEs1AR.js";
import { t as Route$18 } from "./_slug-D7iHGJjY.js";
import { t as Route$19 } from "./new-D-CfTWWO.js";
import React, { useEffect, useTransition } from "react";
import { HeadContent, ScriptOnce, Scripts, createFileRoute, createRootRoute, createRouter as createRouter$1, lazyRouteComponent, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, domAnimation } from "framer-motion";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "i18next";
//#region src/shared/styles/globals.css?url
var globals_default = "/assets/globals-DXKR_-c-.css";
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
				"services": "Services"
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
				"services": "Servicios"
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
var Route$17 = createRootRoute({
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
var $$splitComponentImporter$16 = () => import("./sign-in-Da6AtO6Q.js");
var Route$16 = createFileRoute("/sign-in")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
//#endregion
//#region src/routes/_public/route.tsx
var $$splitComponentImporter$15 = () => import("./route-CPwLkyx2.js");
var Route$15 = createFileRoute("/_public")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
/**
* Pathnames that own their scroll state (split-view / map pages).
* We do NOT force scroll-to-top on these — they manage their own panes.
*/
//#endregion
//#region src/routes/_admin/route.tsx
var $$splitComponentImporter$14 = () => import("./route-BCPJ0hgS.js");
var requireAdmin = createServerFn().handler(createSsrRpc("3fbb17efe26a17757945ced5a774577f93ccd1715634bd638fad4336a0ca15e9"));
var Route$14 = createFileRoute("/_admin")({
	beforeLoad: async () => {
		await requireAdmin();
	},
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
//#endregion
//#region src/routes/_public/index.tsx
var $$splitComponentImporter$13 = () => import("./_public-2nTmm3VZ.js");
var Route$13 = createFileRoute("/_public/")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
//#endregion
//#region src/routes/_public/terms.tsx
var $$splitComponentImporter$12 = () => import("./terms-BN7FlkzW.js");
var Route$12 = createFileRoute("/_public/terms")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
//#endregion
//#region src/routes/_public/privacy.tsx
var $$splitComponentImporter$11 = () => import("./privacy-DCckJgVT.js");
var Route$11 = createFileRoute("/_public/privacy")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
//#endregion
//#region src/routes/_public/press.tsx
var $$splitComponentImporter$10 = () => import("./press-DR2d-Y3c.js");
var Route$10 = createFileRoute("/_public/press")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
//#endregion
//#region src/routes/_public/journal.tsx
var $$splitComponentImporter$9 = () => import("./journal-6HlmxLg9.js");
var Route$9 = createFileRoute("/_public/journal")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
//#endregion
//#region src/routes/_public/explore.tsx
var $$splitComponentImporter$8 = () => import("./explore-YpZZSECt.js");
var Route$8 = createFileRoute("/_public/explore")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
//#endregion
//#region src/routes/_public/cookies.tsx
var $$splitComponentImporter$7 = () => import("./cookies-BNtKOa0q.js");
var Route$7 = createFileRoute("/_public/cookies")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
//#endregion
//#region src/routes/_public/contact.tsx
var $$splitComponentImporter$6 = () => import("./contact-DannFqGF.js");
var Route$6 = createFileRoute("/_public/contact")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
//#endregion
//#region src/routes/_public/about.tsx
var $$splitComponentImporter$5 = () => import("./about-DFS2bGom.js");
var Route$5 = createFileRoute("/_public/about")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
//#endregion
//#region src/routes/_admin/admin/index.tsx
var $$splitComponentImporter$4 = () => import("./admin-BDxwU2qS.js");
var Route$4 = createFileRoute("/_admin/admin/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
//#endregion
//#region src/routes/_admin/admin/login.tsx
var $$splitComponentImporter$3 = () => import("./login-CJK2OXWN.js");
var Route$3 = createFileRoute("/_admin/admin/login")({
	beforeLoad: () => {
		throw redirect({
			to: "/sign-in",
			replace: true
		});
	},
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/_admin/admin/scraping/index.tsx
var $$splitComponentImporter$2 = () => import("./scraping-B8rgqBES.js");
var Route$2 = createFileRoute("/_admin/admin/scraping/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
//#endregion
//#region src/routes/_admin/admin/listings/index.tsx
var $$splitComponentImporter$1 = () => import("./listings-BXmdXxJL.js");
var Route$1 = createFileRoute("/_admin/admin/listings/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
//#endregion
//#region src/routes/_admin/admin/listings/$id.tsx
var $$splitComponentImporter = () => import("./_id-DNfAQwUq.js");
var Route = createFileRoute("/_admin/admin/listings/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
//#endregion
//#region src/routeTree.gen.ts
var SignInRoute = Route$16.update({
	id: "/sign-in",
	path: "/sign-in",
	getParentRoute: () => Route$17
});
var PublicRouteRoute = Route$15.update({
	id: "/_public",
	getParentRoute: () => Route$17
});
var AdminRouteRoute = Route$14.update({
	id: "/_admin",
	getParentRoute: () => Route$17
});
var PublicIndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => PublicRouteRoute
});
var PublicTermsRoute = Route$12.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => PublicRouteRoute
});
var PublicPrivacyRoute = Route$11.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => PublicRouteRoute
});
var PublicPressRoute = Route$10.update({
	id: "/press",
	path: "/press",
	getParentRoute: () => PublicRouteRoute
});
var PublicJournalRoute = Route$9.update({
	id: "/journal",
	path: "/journal",
	getParentRoute: () => PublicRouteRoute
});
var PublicExploreRoute = Route$8.update({
	id: "/explore",
	path: "/explore",
	getParentRoute: () => PublicRouteRoute
});
var PublicCookiesRoute = Route$7.update({
	id: "/cookies",
	path: "/cookies",
	getParentRoute: () => PublicRouteRoute
});
var PublicContactRoute = Route$6.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => PublicRouteRoute
});
var PublicAboutRoute = Route$5.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => PublicRouteRoute
});
var AdminAdminIndexRoute = Route$4.update({
	id: "/admin/",
	path: "/admin/",
	getParentRoute: () => AdminRouteRoute
});
var PublicListingSlugRoute = Route$18.update({
	id: "/listing/$slug",
	path: "/listing/$slug",
	getParentRoute: () => PublicRouteRoute
});
var AdminAdminLoginRoute = Route$3.update({
	id: "/admin/login",
	path: "/admin/login",
	getParentRoute: () => AdminRouteRoute
});
var AdminAdminScrapingIndexRoute = Route$2.update({
	id: "/admin/scraping/",
	path: "/admin/scraping/",
	getParentRoute: () => AdminRouteRoute
});
var AdminAdminListingsIndexRoute = Route$1.update({
	id: "/admin/listings/",
	path: "/admin/listings/",
	getParentRoute: () => AdminRouteRoute
});
var AdminAdminListingsNewRoute = Route$19.update({
	id: "/admin/listings/new",
	path: "/admin/listings/new",
	getParentRoute: () => AdminRouteRoute
});
var AdminRouteRouteChildren = {
	AdminAdminLoginRoute,
	AdminAdminIndexRoute,
	AdminAdminListingsIdRoute: Route.update({
		id: "/admin/listings/$id",
		path: "/admin/listings/$id",
		getParentRoute: () => AdminRouteRoute
	}),
	AdminAdminListingsNewRoute,
	AdminAdminListingsIndexRoute,
	AdminAdminScrapingIndexRoute
};
var AdminRouteRouteWithChildren = AdminRouteRoute._addFileChildren(AdminRouteRouteChildren);
var PublicRouteRouteChildren = {
	PublicAboutRoute,
	PublicContactRoute,
	PublicCookiesRoute,
	PublicExploreRoute,
	PublicJournalRoute,
	PublicPressRoute,
	PublicPrivacyRoute,
	PublicTermsRoute,
	PublicIndexRoute,
	PublicListingSlugRoute
};
var rootRouteChildren = {
	AdminRouteRoute: AdminRouteRouteWithChildren,
	PublicRouteRoute: PublicRouteRoute._addFileChildren(PublicRouteRouteChildren),
	SignInRoute
};
var routeTree = Route$17._addFileChildren(rootRouteChildren)._addFileTypes();
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
