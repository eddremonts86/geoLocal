//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/clerkRuntimeError-DqAmLuLY.mjs
/**
* Creates a type guard function for any error class.
* The returned function can be called as a standalone function or as a method on an error object.
*
* @example
* ```typescript
* class MyError extends Error {}
* const isMyError = createErrorTypeGuard(MyError);
*
* // As a standalone function
* if (isMyError(error)) { ... }
*
* // As a method (when attached to error object)
* if (error.isMyError()) { ... }
* ```
*/
function createErrorTypeGuard(ErrorClass) {
	function typeGuard(error) {
		const target = error ?? this;
		if (!target) throw new TypeError(`${ErrorClass.kind || ErrorClass.name} type guard requires an error object`);
		if (ErrorClass.kind && typeof target === "object" && target !== null && "constructor" in target) {
			if (target.constructor?.kind === ErrorClass.kind) return true;
		}
		return target instanceof ErrorClass;
	}
	return typeGuard;
}
var ClerkError = class ClerkError extends Error {
	static kind = "ClerkError";
	clerkError = true;
	code;
	longMessage;
	docsUrl;
	cause;
	get name() {
		return this.constructor.name;
	}
	constructor(opts) {
		super(new.target.formatMessage(new.target.kind, opts.message, opts.code, opts.docsUrl), { cause: opts.cause });
		Object.setPrototypeOf(this, ClerkError.prototype);
		this.code = opts.code;
		this.docsUrl = opts.docsUrl;
		this.longMessage = opts.longMessage;
		this.cause = opts.cause;
	}
	toString() {
		return `[${this.name}]\nMessage:${this.message}`;
	}
	static formatMessage(name, msg, code, docsUrl) {
		const prefix = "Clerk:";
		const regex = new RegExp(prefix.replace(" ", "\\s*"), "i");
		msg = msg.replace(regex, "");
		msg = `${prefix} ${msg.trim()}\n\n(code="${code}")\n\n`;
		if (docsUrl) msg += `\n\nDocs: ${docsUrl}`;
		return msg;
	}
};
/**
* Custom error class for representing Clerk runtime errors.
*
* @class ClerkRuntimeError
*
* @example
*   throw new ClerkRuntimeError('An error occurred', { code: 'password_invalid' });
*/
var ClerkRuntimeError = class ClerkRuntimeError extends ClerkError {
	static kind = "ClerkRuntimeError";
	/**
	* @deprecated Use `clerkError` property instead. This property is maintained for backward compatibility.
	*/
	clerkRuntimeError = true;
	constructor(message, options) {
		super({
			...options,
			message
		});
		Object.setPrototypeOf(this, ClerkRuntimeError.prototype);
	}
};
createErrorTypeGuard(ClerkRuntimeError);
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/error-NXMTfCAv.mjs
/**
* This error contains the specific error message, code, and any additional metadata that was returned by the Clerk API.
*/
var ClerkAPIError = class {
	static kind = "ClerkAPIError";
	code;
	message;
	longMessage;
	meta;
	constructor(json) {
		const parsedError = {
			code: json.code,
			message: json.message,
			longMessage: json.long_message,
			meta: {
				paramName: json.meta?.param_name,
				sessionId: json.meta?.session_id,
				emailAddresses: json.meta?.email_addresses,
				identifiers: json.meta?.identifiers,
				zxcvbn: json.meta?.zxcvbn,
				plan: json.meta?.plan,
				isPlanUpgradePossible: json.meta?.is_plan_upgrade_possible
			}
		};
		this.code = parsedError.code;
		this.message = parsedError.message;
		this.longMessage = parsedError.longMessage;
		this.meta = parsedError.meta;
	}
};
createErrorTypeGuard(ClerkAPIError);
/**
* Parses a ClerkAPIErrorJSON object into a ClerkAPIError object.
*
* @deprecated Use `ClerkAPIError` class instead
*
* @internal
*/
function parseError(error) {
	return new ClerkAPIError(error);
}
var ClerkAPIResponseError = class ClerkAPIResponseError extends ClerkError {
	static kind = "ClerkAPIResponseError";
	status;
	clerkTraceId;
	retryAfter;
	errors;
	constructor(message, options) {
		const { data: errorsJson, status, clerkTraceId, retryAfter } = options;
		super({
			...options,
			message,
			code: "api_response_error"
		});
		Object.setPrototypeOf(this, ClerkAPIResponseError.prototype);
		this.status = status;
		this.clerkTraceId = clerkTraceId;
		this.retryAfter = retryAfter;
		this.errors = (errorsJson || []).map((e) => new ClerkAPIError(e));
	}
	toString() {
		let message = `[${this.name}]\nMessage:${this.message}\nStatus:${this.status}\nSerialized errors: ${this.errors.map((e) => JSON.stringify(e))}`;
		if (this.clerkTraceId) message += `\nClerk Trace ID: ${this.clerkTraceId}`;
		return message;
	}
	static formatMessage(name, msg, _, __) {
		return msg;
	}
};
/**
* Type guard to check if an error is a ClerkAPIResponseError.
* Can be called as a standalone function or as a method on an error object.
*
* @example
* // As a standalone function
* if (isClerkAPIResponseError(error)) { ... }
*
* // As a method (when attached to error object)
* if (error.isClerkAPIResponseError()) { ... }
*/
var isClerkAPIResponseError = createErrorTypeGuard(ClerkAPIResponseError);
var DefaultMessages = Object.freeze({
	InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
	InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
	MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
	MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
	MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`
});
/**
* Builds an error thrower.
*
* @internal
*/
function buildErrorThrower({ packageName, customMessages }) {
	let pkg = packageName;
	/**
	* Builds a message from a raw message and replacements.
	*
	* @internal
	*/
	function buildMessage(rawMessage, replacements) {
		if (!replacements) return `${pkg}: ${rawMessage}`;
		let msg = rawMessage;
		const matches = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);
		for (const match of matches) {
			const replacement = (replacements[match[1]] || "").toString();
			msg = msg.replace(`{{${match[1]}}}`, replacement);
		}
		return `${pkg}: ${msg}`;
	}
	const messages = {
		...DefaultMessages,
		...customMessages
	};
	return {
		setPackageName({ packageName: packageName$1 }) {
			if (typeof packageName$1 === "string") pkg = packageName$1;
			return this;
		},
		setMessages({ customMessages: customMessages$1 }) {
			Object.assign(messages, customMessages$1 || {});
			return this;
		},
		throwInvalidPublishableKeyError(params) {
			throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
		},
		throwInvalidProxyUrl(params) {
			throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
		},
		throwMissingPublishableKeyError() {
			throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
		},
		throwMissingSecretKeyError() {
			throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
		},
		throwMissingClerkProviderError(params) {
			throw new Error(buildMessage(messages.MissingClerkProvider, params));
		},
		throw(message) {
			throw new Error(buildMessage(message));
		}
	};
}
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/constants-Bta24VLk.mjs
var LEGACY_DEV_INSTANCE_SUFFIXES = [
	".lcl.dev",
	".lclstage.dev",
	".lclclerk.com"
];
var CURRENT_DEV_INSTANCE_SUFFIXES = [
	".accounts.dev",
	".accountsstage.dev",
	".accounts.lclclerk.com"
];
var DEV_OR_STAGING_SUFFIXES = [
	".lcl.dev",
	".stg.dev",
	".lclstage.dev",
	".stgstage.dev",
	".dev.lclclerk.com",
	".stg.lclclerk.com",
	".accounts.lclclerk.com",
	"accountsstage.dev",
	"accounts.dev"
];
var LOCAL_ENV_SUFFIXES = [
	".lcl.dev",
	"lclstage.dev",
	".lclclerk.com",
	".accounts.lclclerk.com"
];
var STAGING_ENV_SUFFIXES = [".accountsstage.dev"];
var LOCAL_API_URL = "https://api.lclclerk.com";
var STAGING_API_URL = "https://api.clerkstage.dev";
var PROD_API_URL = "https://api.clerk.com";
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/isomorphicAtob-CoF80qYz.mjs
/**
* A function that decodes a string of data which has been encoded using base-64 encoding.
* Uses `atob` if available, otherwise uses `Buffer` from `globalThis`. If neither are available, returns the data as-is.
*/
var isomorphicAtob = (data) => {
	if (typeof atob !== "undefined" && typeof atob === "function") return atob(data);
	else if (typeof globalThis.Buffer !== "undefined") return globalThis.Buffer.from(data, "base64").toString();
	return data;
};
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/isomorphicBtoa-DWmLcIHi.mjs
var isomorphicBtoa = (data) => {
	if (typeof btoa !== "undefined" && typeof btoa === "function") return btoa(data);
	else if (typeof globalThis.Buffer !== "undefined") return globalThis.Buffer.from(data).toString("base64");
	return data;
};
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/keys-DuxzP8MU.mjs
/** Prefix used for production publishable keys */
var PUBLISHABLE_KEY_LIVE_PREFIX = "pk_live_";
/** Prefix used for development publishable keys */
var PUBLISHABLE_KEY_TEST_PREFIX = "pk_test_";
/**
* Validates that a decoded publishable key has the correct format.
* The decoded value should be a frontend API followed by exactly one '$' at the end.
*
* @param decoded - The decoded publishable key string to validate.
* @returns `true` if the decoded key has valid format, `false` otherwise.
*/
function isValidDecodedPublishableKey(decoded) {
	if (!decoded.endsWith("$")) return false;
	const withoutTrailing = decoded.slice(0, -1);
	if (withoutTrailing.includes("$")) return false;
	return withoutTrailing.includes(".");
}
/**
* Parses and validates a publishable key, extracting the frontend API and instance type.
*
* @param key - The publishable key to parse.
* @param options - Configuration options for parsing.
* @param options.fatal
* @param options.domain
* @param options.proxyUrl
* @param options.isSatellite
* @returns Parsed publishable key object with instanceType and frontendApi, or null if invalid.
*
* @throws {Error} When options.fatal is true and key is missing or invalid.
*/
function parsePublishableKey(key, options = {}) {
	key = key || "";
	if (!key || !isPublishableKey(key)) {
		if (options.fatal && !key) throw new Error("Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys");
		if (options.fatal && !isPublishableKey(key)) throw new Error("Publishable key not valid.");
		return null;
	}
	const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? "production" : "development";
	let decodedFrontendApi;
	try {
		decodedFrontendApi = isomorphicAtob(key.split("_")[2]);
	} catch {
		if (options.fatal) throw new Error("Publishable key not valid: Failed to decode key.");
		return null;
	}
	if (!isValidDecodedPublishableKey(decodedFrontendApi)) {
		if (options.fatal) throw new Error("Publishable key not valid: Decoded key has invalid format.");
		return null;
	}
	let frontendApi = decodedFrontendApi.slice(0, -1);
	if (options.proxyUrl) frontendApi = options.proxyUrl;
	else if (instanceType !== "development" && options.domain && options.isSatellite) frontendApi = `clerk.${options.domain}`;
	return {
		instanceType,
		frontendApi
	};
}
/**
* Checks if the provided key is a valid publishable key.
*
* @param key - The key to be checked. Defaults to an empty string if not provided.
* @returns `true` if 'key' is a valid publishable key, `false` otherwise.
*/
function isPublishableKey(key = "") {
	try {
		if (!(key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX))) return false;
		const parts = key.split("_");
		if (parts.length !== 3) return false;
		const encodedPart = parts[2];
		if (!encodedPart) return false;
		return isValidDecodedPublishableKey(isomorphicAtob(encodedPart));
	} catch {
		return false;
	}
}
/**
* Creates a memoized cache for checking if URLs are development or staging environments.
* Uses a Map to cache results for better performance on repeated checks.
*
* @returns An object with an isDevOrStagingUrl method that checks if a URL is dev/staging.
*/
function createDevOrStagingUrlCache() {
	const devOrStagingUrlCache = /* @__PURE__ */ new Map();
	return { isDevOrStagingUrl: (url) => {
		if (!url) return false;
		const hostname = typeof url === "string" ? url : url.hostname;
		let res = devOrStagingUrlCache.get(hostname);
		if (res === void 0) {
			res = DEV_OR_STAGING_SUFFIXES.some((s) => hostname.endsWith(s));
			devOrStagingUrlCache.set(hostname, res);
		}
		return res;
	} };
}
/**
* Checks if a publishable key is for a development environment.
* Supports both legacy format (test_) and new format (pk_test_).
*
* @param apiKey - The API key to check.
* @returns `true` if the key is for development, `false` otherwise.
*/
function isDevelopmentFromPublishableKey(apiKey) {
	return apiKey.startsWith("test_") || apiKey.startsWith("pk_test_");
}
/**
* Checks if a secret key is for a development environment.
* Supports both legacy format (test_) and new format (sk_test_).
*
* @param apiKey - The secret key to check.
* @returns `true` if the key is for development, `false` otherwise.
*/
function isDevelopmentFromSecretKey(apiKey) {
	return apiKey.startsWith("test_") || apiKey.startsWith("sk_test_");
}
/**
* Generates a unique cookie suffix based on the publishable key using SHA-1 hashing.
* The suffix is base64-encoded and URL-safe (+ and / characters are replaced).
*
* @param publishableKey - The publishable key to generate suffix from.
* @param subtle - The SubtleCrypto interface to use for hashing (defaults to globalThis.crypto.subtle).
* @returns A promise that resolves to an 8-character URL-safe base64 string.
*/
async function getCookieSuffix(publishableKey, subtle = globalThis.crypto.subtle) {
	const data = new TextEncoder().encode(publishableKey);
	const digest = await subtle.digest("sha-1", data);
	return isomorphicBtoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/gi, "-").replace(/\//gi, "_").substring(0, 8);
}
/**
* Creates a suffixed cookie name by appending the cookie suffix to the base name.
* Used to create unique cookie names based on the publishable key.
*
* @param cookieName - The base cookie name.
* @param cookieSuffix - The suffix to append (typically generated by getCookieSuffix).
* @returns The suffixed cookie name in format: `${cookieName}_${cookieSuffix}`.
*/
var getSuffixedCookieName = (cookieName, cookieSuffix) => {
	return `${cookieName}_${cookieSuffix}`;
};
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/authorization-Un7v7f6J.mjs
var TYPES_TO_OBJECTS = {
	strict_mfa: {
		afterMinutes: 10,
		level: "multi_factor"
	},
	strict: {
		afterMinutes: 10,
		level: "second_factor"
	},
	moderate: {
		afterMinutes: 60,
		level: "second_factor"
	},
	lax: {
		afterMinutes: 1440,
		level: "second_factor"
	}
};
var ALLOWED_LEVELS = new Set([
	"first_factor",
	"second_factor",
	"multi_factor"
]);
var ALLOWED_TYPES = new Set([
	"strict_mfa",
	"strict",
	"moderate",
	"lax"
]);
var ORG_SCOPES = new Set([
	"o",
	"org",
	"organization"
]);
var USER_SCOPES = new Set(["u", "user"]);
var isValidMaxAge = (maxAge) => typeof maxAge === "number" && maxAge > 0;
var isValidLevel = (level) => ALLOWED_LEVELS.has(level);
var isValidVerificationType = (type) => ALLOWED_TYPES.has(type);
var prefixWithOrg = (value) => value.replace(/^(org:)*/, "org:");
/**
* Checks if a user has the required organization-level authorization.
* Verifies if the user has the specified role or permission within their organization.
*
* @returns null, if unable to determine due to missing data or unspecified role/permission.
*/
var checkOrgAuthorization = (params, options) => {
	const { orgId, orgRole, orgPermissions } = options;
	if (!params.role && !params.permission) return null;
	if (!orgId || !orgRole || !orgPermissions) return null;
	if (params.permission) return orgPermissions.includes(prefixWithOrg(params.permission));
	if (params.role) return prefixWithOrg(orgRole) === prefixWithOrg(params.role);
	return null;
};
var checkForFeatureOrPlan = (claim, featureOrPlan) => {
	const { org: orgFeatures, user: userFeatures } = splitByScope(claim);
	const [rawScope, rawId] = featureOrPlan.split(":");
	const hasExplicitScope = rawId !== void 0;
	const scope = rawScope;
	const id = rawId || rawScope;
	if (hasExplicitScope && !ORG_SCOPES.has(scope) && !USER_SCOPES.has(scope)) throw new Error(`Invalid scope: ${scope}`);
	if (hasExplicitScope) {
		if (ORG_SCOPES.has(scope)) return orgFeatures.includes(id);
		if (USER_SCOPES.has(scope)) return userFeatures.includes(id);
	}
	return [...orgFeatures, ...userFeatures].includes(id);
};
var checkBillingAuthorization = (params, options) => {
	const { features, plans } = options;
	if (params.feature && features) return checkForFeatureOrPlan(features, params.feature);
	if (params.plan && plans) return checkForFeatureOrPlan(plans, params.plan);
	return null;
};
var splitByScope = (fea) => {
	const org = [];
	const user = [];
	if (!fea) return {
		org,
		user
	};
	const parts = fea.split(",");
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i].trim();
		const colonIndex = part.indexOf(":");
		if (colonIndex === -1) throw new Error(`Invalid claim element (missing colon): ${part}`);
		const scope = part.slice(0, colonIndex);
		const value = part.slice(colonIndex + 1);
		if (scope === "o") org.push(value);
		else if (scope === "u") user.push(value);
		else if (scope === "ou" || scope === "uo") {
			org.push(value);
			user.push(value);
		}
	}
	return {
		org,
		user
	};
};
var validateReverificationConfig = (config) => {
	if (!config) return false;
	const convertConfigToObject = (config$1) => {
		if (typeof config$1 === "string") return TYPES_TO_OBJECTS[config$1];
		return config$1;
	};
	const isValidStringValue = typeof config === "string" && isValidVerificationType(config);
	const isValidObjectValue = typeof config === "object" && isValidLevel(config.level) && isValidMaxAge(config.afterMinutes);
	if (isValidStringValue || isValidObjectValue) return convertConfigToObject.bind(null, config);
	return false;
};
/**
* Evaluates if the user meets re-verification authentication requirements.
* Compares the user's factor verification ages against the specified maxAge.
* Handles different verification levels (first factor, second factor, multi-factor).
*
* @returns null, if requirements or verification data are missing.
*/
var checkReverificationAuthorization = (params, { factorVerificationAge }) => {
	if (!params.reverification || !factorVerificationAge) return null;
	const isValidReverification = validateReverificationConfig(params.reverification);
	if (!isValidReverification) return null;
	const { level, afterMinutes } = isValidReverification();
	const [factor1Age, factor2Age] = factorVerificationAge;
	const isValidFactor1 = factor1Age !== -1 ? afterMinutes > factor1Age : null;
	const isValidFactor2 = factor2Age !== -1 ? afterMinutes > factor2Age : null;
	switch (level) {
		case "first_factor": return isValidFactor1;
		case "second_factor": return factor2Age !== -1 ? isValidFactor2 : isValidFactor1;
		case "multi_factor": return factor2Age === -1 ? isValidFactor1 : isValidFactor1 && isValidFactor2;
	}
};
/**
* Creates a function for comprehensive user authorization checks.
* Combines organization-level and reverification authentication checks.
* The returned function authorizes if both checks pass, or if at least one passes
* when the other is indeterminate. Fails if userId is missing.
*/
var createCheckAuthorization = (options) => {
	return (params) => {
		if (!options.userId) return false;
		const billingAuthorization = checkBillingAuthorization(params, options);
		const orgAuthorization = checkOrgAuthorization(params, options);
		const reverificationAuthorization = checkReverificationAuthorization(params, options);
		if ([billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === null)) return [billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === true);
		return [billingAuthorization || orgAuthorization, reverificationAuthorization].every((a) => a === true);
	};
};
/**
* Shared utility function that centralizes auth state resolution logic,
* preventing duplication across different packages.
*
* @internal
*/
var resolveAuthState = ({ authObject: { sessionId, sessionStatus, userId, actor, orgId, orgRole, orgSlug, signOut, getToken, has, sessionClaims }, options: { treatPendingAsSignedOut = true } }) => {
	if (sessionId === void 0 && userId === void 0) return {
		actor: void 0,
		getToken,
		has: () => false,
		isLoaded: false,
		isSignedIn: void 0,
		orgId: void 0,
		orgRole: void 0,
		orgSlug: void 0,
		sessionClaims: void 0,
		sessionId,
		signOut,
		userId
	};
	if (sessionId === null && userId === null) return {
		actor: null,
		getToken,
		has: () => false,
		isLoaded: true,
		isSignedIn: false,
		orgId: null,
		orgRole: null,
		orgSlug: null,
		sessionClaims: null,
		sessionId,
		signOut,
		userId
	};
	if (treatPendingAsSignedOut && sessionStatus === "pending") return {
		actor: null,
		getToken,
		has: () => false,
		isLoaded: true,
		isSignedIn: false,
		orgId: null,
		orgRole: null,
		orgSlug: null,
		sessionClaims: null,
		sessionId: null,
		signOut,
		userId: null
	};
	if (!!sessionId && !!sessionClaims && !!userId && !!orgId && !!orgRole) return {
		actor: actor || null,
		getToken,
		has,
		isLoaded: true,
		isSignedIn: true,
		orgId,
		orgRole,
		orgSlug: orgSlug || null,
		sessionClaims,
		sessionId,
		signOut,
		userId
	};
	if (!!sessionId && !!sessionClaims && !!userId && !orgId) return {
		actor: actor || null,
		getToken,
		has,
		isLoaded: true,
		isSignedIn: true,
		orgId: null,
		orgRole: null,
		orgSlug: null,
		sessionClaims,
		sessionId,
		signOut,
		userId
	};
};
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/runtimeEnvironment-D1yr0yUs.mjs
var isDevelopmentEnvironment = () => {
	try {
		return false;
	} catch {}
	return false;
};
var isTestEnvironment = () => {
	try {
		return false;
	} catch {}
	return false;
};
var isProductionEnvironment = () => {
	try {
		return true;
	} catch {}
	return false;
};
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/deprecated--jK9xTNh.mjs
/**
* Mark class method / function as deprecated.
*
* A console WARNING will be displayed when class method / function is invoked.
*
* Examples
* 1. Deprecate class method
* class Example {
*   getSomething = (arg1, arg2) => {
*       deprecated('Example.getSomething', 'Use `getSomethingElse` instead.');
*       return `getSomethingValue:${arg1 || '-'}:${arg2 || '-'}`;
*   };
* }
*
* 2. Deprecate function
* const getSomething = () => {
*   deprecated('getSomething', 'Use `getSomethingElse` instead.');
*   return 'getSomethingValue';
* };
*/
var displayedWarnings = /* @__PURE__ */ new Set();
var deprecated = (fnName, warning, key) => {
	const hideWarning = isTestEnvironment() || isProductionEnvironment();
	const messageId = key ?? fnName;
	if (displayedWarnings.has(messageId) || hideWarning) return;
	displayedWarnings.add(messageId);
	console.warn(`Clerk - DEPRECATION WARNING: "${fnName}" is deprecated and will be removed in the next major release.\n${warning}`);
};
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/retry-DqRIhHV5.mjs
var defaultOptions = {
	initialDelay: 125,
	maxDelayBetweenRetries: 0,
	factor: 2,
	shouldRetry: (_, iteration) => iteration < 5,
	retryImmediately: false,
	jitter: true
};
var RETRY_IMMEDIATELY_DELAY = 100;
var sleep = async (ms) => new Promise((s) => setTimeout(s, ms));
var applyJitter = (delay, jitter) => {
	return jitter ? delay * (1 + Math.random()) : delay;
};
var createExponentialDelayAsyncFn = (opts) => {
	let timesCalled = 0;
	const calculateDelayInMs = () => {
		const constant = opts.initialDelay;
		const base = opts.factor;
		let delay = constant * Math.pow(base, timesCalled);
		delay = applyJitter(delay, opts.jitter);
		return Math.min(opts.maxDelayBetweenRetries || delay, delay);
	};
	return async () => {
		await sleep(calculateDelayInMs());
		timesCalled++;
	};
};
/**
* Retries a callback until it succeeds or the shouldRetry function returns false.
* See {@link RetryOptions} for the available options.
*/
var retry = async (callback, options = {}) => {
	let iterations = 0;
	const { shouldRetry, initialDelay, maxDelayBetweenRetries, factor, retryImmediately, jitter, onBeforeRetry } = {
		...defaultOptions,
		...options
	};
	const delay = createExponentialDelayAsyncFn({
		initialDelay,
		maxDelayBetweenRetries,
		factor,
		jitter
	});
	while (true) try {
		return await callback();
	} catch (e) {
		iterations++;
		if (!shouldRetry(e, iterations)) throw e;
		if (onBeforeRetry) await onBeforeRetry(iterations);
		if (retryImmediately && iterations === 1) await sleep(applyJitter(RETRY_IMMEDIATELY_DELAY, jitter));
		else await delay();
	}
};
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/url-C6gPMFx5.mjs
/**
*
*/
function addClerkPrefix(str) {
	if (!str) return "";
	let regex;
	if (str.match(/^(clerk\.)+\w*$/)) regex = /(clerk\.)*(?=clerk\.)/;
	else if (str.match(/\.clerk.accounts/)) return str;
	else regex = /^(clerk\.)*/gi;
	return `clerk.${str.replace(regex, "")}`;
}
/**
*
*/
function isLegacyDevAccountPortalOrigin(host) {
	return LEGACY_DEV_INSTANCE_SUFFIXES.some((legacyDevSuffix) => {
		return host.startsWith("accounts.") && host.endsWith(legacyDevSuffix);
	});
}
/**
*
*/
function isCurrentDevAccountPortalOrigin(host) {
	return CURRENT_DEV_INSTANCE_SUFFIXES.some((currentDevSuffix) => {
		return host.endsWith(currentDevSuffix) && !host.endsWith(".clerk" + currentDevSuffix);
	});
}
//#endregion
export { ClerkAPIResponseError as C, ClerkError as D, parseError as E, ClerkRuntimeError as O, STAGING_ENV_SUFFIXES as S, isClerkAPIResponseError as T, LEGACY_DEV_INSTANCE_SUFFIXES as _, deprecated as a, PROD_API_URL as b, resolveAuthState as c, getCookieSuffix as d, getSuffixedCookieName as f, isomorphicAtob as g, parsePublishableKey as h, retry as i, splitByScope as l, isDevelopmentFromSecretKey as m, isCurrentDevAccountPortalOrigin as n, isDevelopmentEnvironment as o, isDevelopmentFromPublishableKey as p, isLegacyDevAccountPortalOrigin as r, createCheckAuthorization as s, addClerkPrefix as t, createDevOrStagingUrlCache as u, LOCAL_API_URL as v, buildErrorThrower as w, STAGING_API_URL as x, LOCAL_ENV_SUFFIXES as y };
