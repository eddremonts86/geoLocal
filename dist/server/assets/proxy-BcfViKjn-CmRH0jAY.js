import { h as parsePublishableKey } from "./url-C6gPMFx5-BTKoIneT.js";
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/underscore-ClYSgvuy.mjs
/**
* Converts a string from snake_case to camelCase.
*/
function snakeToCamel(str) {
	return str ? str.replace(/([-_][a-z])/g, (match) => match.toUpperCase().replace(/-|_/, "")) : "";
}
/**
* Converts a string from camelCase to snake_case.
*/
function camelToSnake(str) {
	return str ? str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) : "";
}
var createDeepObjectTransformer = (transform) => {
	const deepTransform = (obj) => {
		if (!obj) return obj;
		if (Array.isArray(obj)) return obj.map((el) => {
			if (typeof el === "object" || Array.isArray(el)) return deepTransform(el);
			return el;
		});
		const copy = { ...obj };
		const keys = Object.keys(copy);
		for (const oldName of keys) {
			const newName = transform(oldName.toString());
			if (newName !== oldName) {
				copy[newName] = copy[oldName];
				delete copy[oldName];
			}
			if (typeof copy[newName] === "object") copy[newName] = deepTransform(copy[newName]);
		}
		return copy;
	};
	return deepTransform;
};
createDeepObjectTransformer(camelToSnake);
createDeepObjectTransformer(snakeToCamel);
/**
* A function to determine if a value is truthy.
*
* @returns True for `true`, true, positive numbers. False for `false`, false, 0, negative integers and anything else.
*/
function isTruthy(value) {
	if (typeof value === `boolean`) return value;
	if (value === void 0 || value === null) return false;
	if (typeof value === `string`) {
		if (value.toLowerCase() === `true`) return true;
		if (value.toLowerCase() === `false`) return false;
	}
	const number = parseInt(value, 10);
	if (isNaN(number)) return false;
	if (number > 0) return true;
	return false;
}
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/telemetry-DE2JFEBf.mjs
var DEFAULT_CACHE_TTL_MS = 864e5;
/**
* Manages throttling for telemetry events using a configurable cache implementation
* to mitigate event flooding in frequently executed code paths.
*/
var TelemetryEventThrottler = class {
	#cache;
	#cacheTtl = DEFAULT_CACHE_TTL_MS;
	constructor(cache) {
		this.#cache = cache;
	}
	isEventThrottled(payload) {
		const now = Date.now();
		const key = this.#generateKey(payload);
		const entry = this.#cache.getItem(key);
		if (!entry) {
			this.#cache.setItem(key, now);
			return false;
		}
		if (now - entry > this.#cacheTtl) {
			this.#cache.setItem(key, now);
			return false;
		}
		return true;
	}
	/**
	* Generates a consistent unique key for telemetry events by sorting payload properties.
	* This ensures that payloads with identical content in different orders produce the same key.
	*/
	#generateKey(event) {
		const { sk: _sk, pk: _pk, payload, ...rest } = event;
		const sanitizedEvent = {
			...payload,
			...rest
		};
		return JSON.stringify(Object.keys({
			...payload,
			...rest
		}).sort().map((key) => sanitizedEvent[key]));
	}
};
/**
* LocalStorage-based cache implementation for browser environments.
*/
var LocalStorageThrottlerCache = class {
	#storageKey = "clerk_telemetry_throttler";
	getItem(key) {
		return this.#getCache()[key];
	}
	setItem(key, value) {
		try {
			const cache = this.#getCache();
			cache[key] = value;
			localStorage.setItem(this.#storageKey, JSON.stringify(cache));
		} catch (err) {
			if (err instanceof DOMException && (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED") && localStorage.length > 0) localStorage.removeItem(this.#storageKey);
		}
	}
	removeItem(key) {
		try {
			const cache = this.#getCache();
			delete cache[key];
			localStorage.setItem(this.#storageKey, JSON.stringify(cache));
		} catch {}
	}
	#getCache() {
		try {
			const cacheString = localStorage.getItem(this.#storageKey);
			if (!cacheString) return {};
			return JSON.parse(cacheString);
		} catch {
			return {};
		}
	}
	static isSupported() {
		return typeof window !== "undefined" && !!window.localStorage;
	}
};
/**
* In-memory cache implementation for non-browser environments (e.g., React Native).
*/
var InMemoryThrottlerCache = class {
	#cache = /* @__PURE__ */ new Map();
	#maxSize = 1e4;
	getItem(key) {
		if (this.#cache.size > this.#maxSize) {
			this.#cache.clear();
			return;
		}
		return this.#cache.get(key);
	}
	setItem(key, value) {
		this.#cache.set(key, value);
	}
	removeItem(key) {
		this.#cache.delete(key);
	}
};
/**
* The `TelemetryCollector` class handles collection of telemetry events from Clerk SDKs. Telemetry is opt-out and can be disabled by setting a CLERK_TELEMETRY_DISABLED environment variable.
* The `ClerkProvider` also accepts a `telemetry` prop that will be passed to the collector during initialization:.
*
* ```jsx
* <ClerkProvider telemetry={false}>
*    ...
* </ClerkProvider>
* ```
*
* For more information, please see the telemetry documentation page: https://clerk.com/docs/telemetry.
*/
/**
* Type guard to check if window.Clerk exists and has the expected structure.
*/
function isWindowClerkWithMetadata(clerk) {
	return typeof clerk === "object" && clerk !== null && "constructor" in clerk && typeof clerk.constructor === "function";
}
var VALID_LOG_LEVELS = new Set([
	"error",
	"warn",
	"info",
	"debug",
	"trace"
]);
var DEFAULT_CONFIG = {
	samplingRate: 1,
	maxBufferSize: 5,
	endpoint: "https://clerk-telemetry.com"
};
var TelemetryCollector = class {
	#config;
	#eventThrottler;
	#metadata = {};
	#buffer = [];
	#pendingFlush = null;
	constructor(options) {
		this.#config = {
			maxBufferSize: options.maxBufferSize ?? DEFAULT_CONFIG.maxBufferSize,
			samplingRate: options.samplingRate ?? DEFAULT_CONFIG.samplingRate,
			perEventSampling: options.perEventSampling ?? true,
			disabled: options.disabled ?? false,
			debug: options.debug ?? false,
			endpoint: DEFAULT_CONFIG.endpoint
		};
		if (!options.clerkVersion && typeof window === "undefined") this.#metadata.clerkVersion = "";
		else this.#metadata.clerkVersion = options.clerkVersion ?? "";
		this.#metadata.sdk = options.sdk;
		this.#metadata.sdkVersion = options.sdkVersion;
		this.#metadata.publishableKey = options.publishableKey ?? "";
		const parsedKey = parsePublishableKey(options.publishableKey);
		if (parsedKey) this.#metadata.instanceType = parsedKey.instanceType;
		if (options.secretKey) this.#metadata.secretKey = options.secretKey.substring(0, 16);
		this.#eventThrottler = new TelemetryEventThrottler(LocalStorageThrottlerCache.isSupported() ? new LocalStorageThrottlerCache() : new InMemoryThrottlerCache());
	}
	get isEnabled() {
		if (this.#metadata.instanceType !== "development") return false;
		if (this.#config.disabled || typeof process !== "undefined" && process.env && isTruthy(process.env.CLERK_TELEMETRY_DISABLED)) return false;
		if (typeof window !== "undefined" && !!window?.navigator?.webdriver) return false;
		return true;
	}
	get isDebug() {
		return this.#config.debug || typeof process !== "undefined" && process.env && isTruthy(process.env.CLERK_TELEMETRY_DEBUG);
	}
	record(event) {
		try {
			const preparedPayload = this.#preparePayload(event.event, event.payload);
			this.#logEvent(preparedPayload.event, preparedPayload);
			if (!this.#shouldRecord(preparedPayload, event.eventSamplingRate)) return;
			this.#buffer.push({
				kind: "event",
				value: preparedPayload
			});
			this.#scheduleFlush();
		} catch (error) {
			console.error("[clerk/telemetry] Error recording telemetry event", error);
		}
	}
	/**
	* Records a telemetry log entry if logging is enabled and not in debug mode.
	*
	* @param entry - The telemetry log entry to record.
	*/
	recordLog(entry) {
		try {
			if (!this.#shouldRecordLog(entry)) return;
			const levelIsValid = typeof entry?.level === "string" && VALID_LOG_LEVELS.has(entry.level);
			const messageIsValid = typeof entry?.message === "string" && entry.message.trim().length > 0;
			let normalizedTimestamp = null;
			const timestampInput = entry?.timestamp;
			if (typeof timestampInput === "number" || typeof timestampInput === "string") {
				const candidate = new Date(timestampInput);
				if (!Number.isNaN(candidate.getTime())) normalizedTimestamp = candidate;
			}
			if (!levelIsValid || !messageIsValid || normalizedTimestamp === null) {
				if (this.isDebug && typeof console !== "undefined") console.warn("[clerk/telemetry] Dropping invalid telemetry log entry", {
					levelIsValid,
					messageIsValid,
					timestampIsValid: normalizedTimestamp !== null
				});
				return;
			}
			const sdkMetadata = this.#getSDKMetadata();
			const logData = {
				sdk: sdkMetadata.name,
				sdkv: sdkMetadata.version,
				cv: this.#metadata.clerkVersion ?? "",
				lvl: entry.level,
				msg: entry.message,
				ts: normalizedTimestamp.toISOString(),
				pk: this.#metadata.publishableKey || null,
				payload: this.#sanitizeContext(entry.context)
			};
			this.#buffer.push({
				kind: "log",
				value: logData
			});
			this.#scheduleFlush();
		} catch (error) {
			console.error("[clerk/telemetry] Error recording telemetry log entry", error);
		}
	}
	#shouldRecord(preparedPayload, eventSamplingRate) {
		return this.isEnabled && !this.isDebug && this.#shouldBeSampled(preparedPayload, eventSamplingRate);
	}
	#shouldRecordLog(_entry) {
		return true;
	}
	#shouldBeSampled(preparedPayload, eventSamplingRate) {
		const randomSeed = Math.random();
		if (!(randomSeed <= this.#config.samplingRate && (this.#config.perEventSampling === false || typeof eventSamplingRate === "undefined" || randomSeed <= eventSamplingRate))) return false;
		return !this.#eventThrottler.isEventThrottled(preparedPayload);
	}
	#scheduleFlush() {
		if (typeof window === "undefined") {
			this.#flush();
			return;
		}
		if (this.#buffer.length >= this.#config.maxBufferSize) {
			if (this.#pendingFlush) if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(Number(this.#pendingFlush));
			else clearTimeout(Number(this.#pendingFlush));
			this.#flush();
			return;
		}
		if (this.#pendingFlush) return;
		if ("requestIdleCallback" in window) this.#pendingFlush = requestIdleCallback(() => {
			this.#flush();
			this.#pendingFlush = null;
		});
		else this.#pendingFlush = setTimeout(() => {
			this.#flush();
			this.#pendingFlush = null;
		}, 0);
	}
	#flush() {
		const itemsToSend = [...this.#buffer];
		this.#buffer = [];
		this.#pendingFlush = null;
		if (itemsToSend.length === 0) return;
		const eventsToSend = itemsToSend.filter((item) => item.kind === "event").map((item) => item.value);
		const logsToSend = itemsToSend.filter((item) => item.kind === "log").map((item) => item.value);
		if (eventsToSend.length > 0) {
			const eventsUrl = new URL("/v1/event", this.#config.endpoint);
			fetch(eventsUrl, {
				headers: { "Content-Type": "application/json" },
				keepalive: true,
				method: "POST",
				body: JSON.stringify({ events: eventsToSend })
			}).catch(() => void 0);
		}
		if (logsToSend.length > 0) {
			const logsUrl = new URL("/v1/logs", this.#config.endpoint);
			fetch(logsUrl, {
				headers: { "Content-Type": "application/json" },
				keepalive: true,
				method: "POST",
				body: JSON.stringify({ logs: logsToSend })
			}).catch(() => void 0);
		}
	}
	/**
	* If running in debug mode, log the event and its payload to the console.
	*/
	#logEvent(event, payload) {
		if (!this.isDebug) return;
		if (typeof console.groupCollapsed !== "undefined") {
			console.groupCollapsed("[clerk/telemetry]", event);
			console.log(payload);
			console.groupEnd();
		} else console.log("[clerk/telemetry]", event, payload);
	}
	/**
	* If in browser, attempt to lazily grab the SDK metadata from the Clerk singleton, otherwise fallback to the initially passed in values.
	*
	* This is necessary because the sdkMetadata can be set by the host SDK after the TelemetryCollector is instantiated.
	*/
	#getSDKMetadata() {
		const sdkMetadata = {
			name: this.#metadata.sdk,
			version: this.#metadata.sdkVersion
		};
		if (typeof window !== "undefined") {
			const windowWithClerk = window;
			if (windowWithClerk.Clerk) {
				const windowClerk = windowWithClerk.Clerk;
				if (isWindowClerkWithMetadata(windowClerk) && windowClerk.constructor.sdkMetadata) {
					const { name, version } = windowClerk.constructor.sdkMetadata;
					if (name !== void 0) sdkMetadata.name = name;
					if (version !== void 0) sdkMetadata.version = version;
				}
			}
		}
		return sdkMetadata;
	}
	/**
	* Append relevant metadata from the Clerk singleton to the event payload.
	*/
	#preparePayload(event, payload) {
		const sdkMetadata = this.#getSDKMetadata();
		return {
			event,
			cv: this.#metadata.clerkVersion ?? "",
			it: this.#metadata.instanceType ?? "",
			sdk: sdkMetadata.name,
			sdkv: sdkMetadata.version,
			...this.#metadata.publishableKey ? { pk: this.#metadata.publishableKey } : {},
			...this.#metadata.secretKey ? { sk: this.#metadata.secretKey } : {},
			payload
		};
	}
	/**
	* Best-effort sanitization of the context payload. Returns a plain object with JSON-serializable
	* values or null when the input is missing or not serializable. Arrays are not accepted.
	*/
	#sanitizeContext(context) {
		if (context === null || typeof context === "undefined") return null;
		if (typeof context !== "object") return null;
		try {
			const cleaned = JSON.parse(JSON.stringify(context));
			if (cleaned && typeof cleaned === "object" && !Array.isArray(cleaned)) return cleaned;
			return null;
		} catch {
			return null;
		}
	}
};
var EVENT_METHOD_CALLED = "METHOD_CALLED";
var EVENT_SAMPLING_RATE$2 = .1;
/**
* Fired when a helper method is called from a Clerk SDK.
*/
function eventMethodCalled(method, payload) {
	return {
		event: EVENT_METHOD_CALLED,
		eventSamplingRate: EVENT_SAMPLING_RATE$2,
		payload: {
			method,
			...payload
		}
	};
}
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/getEnvVariable.mjs
var hasCloudflareProxyContext = (context) => {
	return !!context?.cloudflare?.env;
};
var hasCloudflareContext = (context) => {
	return !!context?.env;
};
/**
* Retrieves an environment variable across runtime environments.
*
* @param name - The environment variable name to retrieve.
* @param context - Optional context object that may contain environment values.
* @returns The environment variable value or empty string if not found.
*/
var getEnvVariable = (name, context) => {
	if (typeof process !== "undefined" && process.env && typeof process.env[name] === "string") return process.env[name];
	if (typeof import.meta !== "undefined" && typeof {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}[name] === "string") return {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}[name];
	if (hasCloudflareProxyContext(context)) return context.cloudflare.env[name] || "";
	if (hasCloudflareContext(context)) return context.env[name] || "";
	if (context && typeof context[name] === "string") return context[name];
	try {
		return globalThis[name];
	} catch {}
	return "";
};
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/proxy-BcfViKjn.mjs
/**
*
*/
function isValidProxyUrl(key) {
	if (!key) return true;
	return isHttpOrHttps(key) || isProxyUrlRelative(key);
}
/**
*
*/
function isHttpOrHttps(key) {
	return /^http(s)?:\/\//.test(key || "");
}
/**
*
*/
function isProxyUrlRelative(key) {
	return key.startsWith("/");
}
/**
*
*/
function proxyUrlToAbsoluteURL(url) {
	if (!url) return "";
	return isProxyUrlRelative(url) ? new URL(url, window.location.origin).toString() : url;
}
//#endregion
export { getEnvVariable as a, isTruthy as c, proxyUrlToAbsoluteURL as i, isProxyUrlRelative as n, TelemetryCollector as o, isValidProxyUrl as r, eventMethodCalled as s, isHttpOrHttps as t };
