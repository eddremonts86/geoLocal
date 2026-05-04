import { C as LOCAL_ENV_SUFFIXES, E as STAGING_ENV_SUFFIXES, O as isDevelopmentEnvironment, S as LOCAL_API_URL, T as STAGING_API_URL, _ as isDevelopmentFromPublishableKey, v as isDevelopmentFromSecretKey, w as PROD_API_URL, x as LEGACY_DEV_INSTANCE_SUFFIXES, y as parsePublishableKey } from "./authorization-Un7v7f6J-BJBnYkoP.js";
import { a as createClerkRequest, c as verifyToken, i as createBackendApiClient, n as constants, o as debugRequestState, r as createAuthenticateRequest, t as AuthStatus } from "./internal-DXCdJK08.js";
import { t as errorThrower } from "./utils-D2z7vV21.js";
import { a as getEnvVariable, c as isTruthy, n as isProxyUrlRelative, o as TelemetryCollector, t as isHttpOrHttps } from "./proxy-BcfViKjn-B9Zqv6id.js";
import { t as getPublicEnvVariables } from "./env-lrErrSrj.js";
import * as fs from "fs";
import * as path from "path";
//#region node_modules/.pnpm/@tanstack+start-client-core@1.167.17/node_modules/@tanstack/start-client-core/dist/esm/createMiddleware.js
var createMiddleware = (options, __opts) => {
	const resolvedOptions = {
		type: "request",
		...__opts || options
	};
	return {
		options: resolvedOptions,
		middleware: (middleware) => {
			return createMiddleware({}, Object.assign(resolvedOptions, { middleware }));
		},
		inputValidator: (inputValidator) => {
			return createMiddleware({}, Object.assign(resolvedOptions, { inputValidator }));
		},
		client: (client) => {
			return createMiddleware({}, Object.assign(resolvedOptions, { client }));
		},
		server: (server) => {
			return createMiddleware({}, Object.assign(resolvedOptions, { server }));
		}
	};
};
//#endregion
//#region node_modules/.pnpm/@tanstack+start-client-core@1.167.17/node_modules/@tanstack/start-client-core/dist/esm/createStart.js
function dedupeSerializationAdapters(deduped, serializationAdapters) {
	for (let i = 0, len = serializationAdapters.length; i < len; i++) {
		const current = serializationAdapters[i];
		if (!deduped.has(current)) {
			deduped.add(current);
			if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
		}
	}
}
var createStart = (getOptions) => {
	return {
		getOptions: async () => {
			const options = await getOptions();
			if (options.serializationAdapters) {
				const deduped = /* @__PURE__ */ new Set();
				dedupeSerializationAdapters(deduped, options.serializationAdapters);
				options.serializationAdapters = Array.from(deduped);
			}
			return options;
		},
		createMiddleware
	};
};
//#endregion
//#region node_modules/.pnpm/@clerk+backend@3.2.13_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/backend/dist/chunk-P263NW7Z.mjs
function withLegacyReturn(cb) {
	return async (...args) => {
		const { data, errors } = await cb(...args);
		if (errors) throw errors[0];
		return data;
	};
}
withLegacyReturn(verifyToken);
function createClerkClient(options) {
	const opts = { ...options };
	const apiClient = createBackendApiClient(opts);
	const requestState = createAuthenticateRequest({
		options: opts,
		apiClient
	});
	const telemetry = new TelemetryCollector({
		publishableKey: opts.publishableKey,
		secretKey: opts.secretKey,
		samplingRate: .1,
		...opts.sdkMetadata ? {
			sdk: opts.sdkMetadata.name,
			sdkVersion: opts.sdkMetadata.version
		} : {},
		...opts.telemetry || {}
	});
	return {
		...apiClient,
		...requestState,
		telemetry
	};
}
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/apiUrlFromPublishableKey.mjs
/**
* Get the correct API url based on the publishable key.
*
* @param publishableKey - The publishable key to parse.
* @returns One of Clerk's API URLs.
*/
var apiUrlFromPublishableKey = (publishableKey) => {
	const frontendApi = parsePublishableKey(publishableKey)?.frontendApi;
	if (frontendApi?.startsWith("clerk.") && LEGACY_DEV_INSTANCE_SUFFIXES.some((suffix) => frontendApi?.endsWith(suffix))) return PROD_API_URL;
	if (LOCAL_ENV_SUFFIXES.some((suffix) => frontendApi?.endsWith(suffix))) return LOCAL_API_URL;
	if (STAGING_ENV_SUFFIXES.some((suffix) => frontendApi?.endsWith(suffix))) return STAGING_API_URL;
	return PROD_API_URL;
};
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/server/constants.js
var commonEnvs = () => {
	const publicEnvs = getPublicEnvVariables();
	return {
		CLERK_JS_VERSION: publicEnvs.clerkJsVersion,
		CLERK_JS_URL: publicEnvs.clerkJsUrl,
		CLERK_UI_URL: publicEnvs.clerkUIUrl,
		CLERK_UI_VERSION: publicEnvs.clerkUIVersion,
		PREFETCH_UI: publicEnvs.prefetchUI,
		PUBLISHABLE_KEY: publicEnvs.publishableKey,
		DOMAIN: publicEnvs.domain,
		PROXY_URL: publicEnvs.proxyUrl,
		IS_SATELLITE: publicEnvs.isSatellite,
		SIGN_IN_URL: publicEnvs.signInUrl,
		SIGN_UP_URL: publicEnvs.signUpUrl,
		TELEMETRY_DISABLED: publicEnvs.telemetryDisabled,
		TELEMETRY_DEBUG: publicEnvs.telemetryDebug,
		API_VERSION: getEnvVariable("CLERK_API_VERSION") || "v1",
		SECRET_KEY: getEnvVariable("CLERK_SECRET_KEY"),
		MACHINE_SECRET_KEY: getEnvVariable("CLERK_MACHINE_SECRET_KEY"),
		ENCRYPTION_KEY: getEnvVariable("CLERK_ENCRYPTION_KEY"),
		CLERK_JWT_KEY: getEnvVariable("CLERK_JWT_KEY"),
		API_URL: getEnvVariable("CLERK_API_URL") || apiUrlFromPublishableKey(publicEnvs.publishableKey),
		SDK_METADATA: {
			name: "@clerk/tanstack-react-start",
			version: "1.1.3",
			environment: getEnvVariable("NODE_ENV")
		}
	};
};
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/server/clerkClient.js
var clerkClient = (options) => {
	const commonEnv = commonEnvs();
	return createClerkClient({
		secretKey: commonEnv.SECRET_KEY,
		machineSecretKey: commonEnv.MACHINE_SECRET_KEY,
		publishableKey: commonEnv.PUBLISHABLE_KEY,
		apiUrl: commonEnv.API_URL,
		apiVersion: commonEnv.API_VERSION,
		userAgent: `@clerk/tanstack-react-start@1.1.3`,
		proxyUrl: commonEnv.PROXY_URL,
		domain: commonEnv.DOMAIN,
		isSatellite: commonEnv.IS_SATELLITE,
		sdkMetadata: commonEnv.SDK_METADATA,
		telemetry: {
			disabled: commonEnv.TELEMETRY_DISABLED,
			debug: commonEnv.TELEMETRY_DEBUG
		},
		...options
	});
};
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/netlifyCacheHandler-Dkdkho_6.mjs
/**
* Cache busting parameter for Netlify to prevent cached responses
* during handshake flows with Clerk development instances.
*
* Note: This query parameter will be removed in the "@clerk/clerk-js" package.
*
* @internal
*/
var CLERK_NETLIFY_CACHE_BUST_PARAM = "__clerk_netlify_cache_bust";
/**
* Returns true if running in a Netlify environment.
* Checks for Netlify-specific environment variables in process.env.
* Safe for browser and non-Node environments.
*/
function isNetlifyRuntime() {
	if (typeof process === "undefined" || !process.env) return false;
	return Boolean(process.env.NETLIFY) || Boolean(process.env.NETLIFY_FUNCTIONS_TOKEN) || typeof process.env.URL === "string" && process.env.URL.endsWith("netlify.app");
}
/**
* Prevents infinite redirects in Netlify's functions by adding a cache bust parameter
* to the original redirect URL. This ensures that Netlify doesn't serve a cached response
* during the handshake flow.
*
* The issue happens only on Clerk development instances running on Netlify. This is
* a workaround until we find a better solution.
*
* See https://answers.netlify.com/t/cache-handling-recommendation-for-authentication-handshake-redirects/143969/1.
*
* @internal
*/
function handleNetlifyCacheInDevInstance({ locationHeader, requestStateHeaders, publishableKey }) {
	const isOnNetlify = isNetlifyRuntime();
	const isDevelopmentInstance = isDevelopmentFromPublishableKey(publishableKey);
	if (isOnNetlify && isDevelopmentInstance) {
		if (!locationHeader.includes("__clerk_handshake")) {
			const url = new URL(locationHeader);
			url.searchParams.append(CLERK_NETLIFY_CACHE_BUST_PARAM, Date.now().toString());
			requestStateHeaders.set("Location", url.toString());
		}
	}
}
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/utils/feature-flags.js
var KEYLESS_DISABLED = isTruthy(getEnvVariable("VITE_CLERK_KEYLESS_DISABLED")) || isTruthy(getEnvVariable("CLERK_KEYLESS_DISABLED")) || false;
var canUseKeyless = isDevelopmentEnvironment() && !KEYLESS_DISABLED;
//#endregion
//#region node_modules/.pnpm/@clerk+shared@4.8.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/shared/dist/runtime/keyless/index.mjs
var THROTTLE_DURATION_MS = 600 * 1e3;
/**
* Creates a development-only cache for keyless mode logging and API calls.
* This prevents console spam and duplicate API requests.
*
* @returns The cache instance or undefined in non-development environments
*/
function createClerkDevCache() {
	if (!isDevelopmentEnvironment()) return;
	if (!globalThis.__clerk_internal_keyless_logger) globalThis.__clerk_internal_keyless_logger = {
		__cache: /* @__PURE__ */ new Map(),
		log: function({ cacheKey, msg }) {
			if (this.__cache.has(cacheKey) && Date.now() < (this.__cache.get(cacheKey)?.expiresAt || 0)) return;
			console.log(msg);
			this.__cache.set(cacheKey, { expiresAt: Date.now() + THROTTLE_DURATION_MS });
		},
		run: async function(callback, { cacheKey, onSuccessStale = THROTTLE_DURATION_MS, onErrorStale = THROTTLE_DURATION_MS }) {
			if (this.__cache.has(cacheKey) && Date.now() < (this.__cache.get(cacheKey)?.expiresAt || 0)) return this.__cache.get(cacheKey)?.data;
			try {
				const result = await callback();
				this.__cache.set(cacheKey, {
					expiresAt: Date.now() + onSuccessStale,
					data: result
				});
				return result;
			} catch (e) {
				this.__cache.set(cacheKey, { expiresAt: Date.now() + onErrorStale });
				throw e;
			}
		}
	};
	return globalThis.__clerk_internal_keyless_logger;
}
/**
* Creates the console message shown when running in keyless mode.
*
* @param keys - The keyless application keys
* @returns Formatted console message
*/
function createKeylessModeMessage(keys) {
	return `\n\x1b[35m\n[Clerk]:\x1b[0m You are running in keyless mode.\nYou can \x1b[35mclaim your keys\x1b[0m by visiting ${keys.claimUrl}\n`;
}
/**
* Creates the console message shown when keys have been claimed.
*
* @returns Formatted console message
*/
function createConfirmationMessage() {
	return `\n\x1b[35m\n[Clerk]:\x1b[0m Your application is running with your claimed keys.\nYou can safely remove the \x1b[35m.clerk/\x1b[0m from your project.\n`;
}
/**
* Shared singleton instance of the development cache.
*/
var clerkDevelopmentCache = createClerkDevCache();
var CLERK_HIDDEN = ".clerk";
var CLERK_LOCK = "clerk.lock";
var TEMP_DIR_NAME = ".tmp";
var CONFIG_FILE = "keyless.json";
var README_FILE = "README.md";
/**
* Creates a file-based storage adapter for keyless mode.
* This is used by Node.js-based frameworks (Next.js, TanStack Start, etc.)
* to persist keyless configuration to the file system.
*
* @param fs - Node.js fs module or compatible adapter
* @param path - Node.js path module or compatible adapter
* @param options - Configuration options
* @returns A KeylessStorage implementation
*/
function createNodeFileStorage(fs, path, options = {}) {
	const { cwd = () => process.cwd(), frameworkPackageName = "@clerk/shared" } = options;
	let inMemoryLock = false;
	const getClerkDir = () => path.join(cwd(), CLERK_HIDDEN);
	const getTempDir = () => path.join(getClerkDir(), TEMP_DIR_NAME);
	const getConfigPath = () => path.join(getTempDir(), CONFIG_FILE);
	const getReadmePath = () => path.join(getTempDir(), README_FILE);
	const getLockPath = () => path.join(cwd(), CLERK_LOCK);
	const isLocked = () => inMemoryLock || fs.existsSync(getLockPath());
	const lock = () => {
		if (isLocked()) return false;
		inMemoryLock = true;
		try {
			fs.writeFileSync(getLockPath(), "This file can be deleted if your app is stuck.", {
				encoding: "utf8",
				mode: 420
			});
			return true;
		} catch {
			inMemoryLock = false;
			return false;
		}
	};
	const unlock = () => {
		inMemoryLock = false;
		try {
			if (fs.existsSync(getLockPath())) fs.rmSync(getLockPath(), { force: true });
		} catch {}
	};
	const ensureDirectoryExists = () => {
		const tempDir = getTempDir();
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
	};
	const updateGitignore = () => {
		const gitignorePath = path.join(cwd(), ".gitignore");
		const entry = `/${CLERK_HIDDEN}/`;
		if (!fs.existsSync(gitignorePath)) fs.writeFileSync(gitignorePath, "", {
			encoding: "utf8",
			mode: 420
		});
		if (!fs.readFileSync(gitignorePath, { encoding: "utf-8" }).includes(entry)) fs.appendFileSync(gitignorePath, `\n# clerk configuration (can include secrets)\n${entry}\n`);
	};
	const writeReadme = () => {
		const readme = `## DO NOT COMMIT
This directory is auto-generated from \`${frameworkPackageName}\` because you are running in Keyless mode.
Avoid committing the \`.clerk/\` directory as it includes the secret key of the unclaimed instance.
`;
		fs.writeFileSync(getReadmePath(), readme, {
			encoding: "utf8",
			mode: 384
		});
	};
	return {
		read() {
			try {
				if (!fs.existsSync(getConfigPath())) return "";
				return fs.readFileSync(getConfigPath(), { encoding: "utf-8" });
			} catch {
				return "";
			}
		},
		write(data) {
			if (!lock()) return;
			try {
				ensureDirectoryExists();
				updateGitignore();
				writeReadme();
				fs.writeFileSync(getConfigPath(), data, {
					encoding: "utf8",
					mode: 384
				});
			} finally {
				unlock();
			}
		},
		remove() {
			if (!lock()) return;
			try {
				if (fs.existsSync(getClerkDir())) fs.rmSync(getClerkDir(), {
					recursive: true,
					force: true
				});
			} finally {
				unlock();
			}
		}
	};
}
/**
* Creates metadata headers for the keyless service.
*/
function createMetadataHeaders(framework, frameworkVersion) {
	const headers = new Headers();
	if (framework) headers.set("Clerk-Framework", framework);
	if (frameworkVersion) headers.set("Clerk-Framework-Version", frameworkVersion);
	return headers;
}
/**
* Creates a keyless service that handles accountless application creation and storage.
* This provides a simple API for frameworks to integrate keyless mode.
*
* @param options - Configuration for the service including storage and API adapters
* @returns A keyless service instance
*
* @example
* ```ts
* import { createKeylessService } from '@clerk/shared/keyless';
*
* const keylessService = createKeylessService({
*   storage: createFileStorage(),
*   api: createKeylessAPI({ secretKey }),
*   framework: 'TanStack Start',
* });
*
* const keys = await keylessService.getOrCreateKeys(request);
* if (keys) {
*   console.log('Publishable Key:', keys.publishableKey);
* }
* ```
*/
function createKeylessService(options) {
	const { storage, api, framework, frameworkVersion } = options;
	let hasLoggedKeylessMessage = false;
	const safeParseConfig = () => {
		try {
			const data = storage.read();
			if (!data) return;
			return JSON.parse(data);
		} catch {
			return;
		}
	};
	return {
		async getOrCreateKeys() {
			const existingConfig = safeParseConfig();
			if (existingConfig?.publishableKey && existingConfig?.secretKey) return existingConfig;
			const headers = createMetadataHeaders(framework, frameworkVersion);
			const accountlessApplication = await api.createAccountlessApplication(headers);
			if (accountlessApplication) storage.write(JSON.stringify(accountlessApplication));
			return accountlessApplication;
		},
		readKeys() {
			return safeParseConfig();
		},
		removeKeys() {
			storage.remove();
		},
		async completeOnboarding() {
			const headers = createMetadataHeaders(framework, frameworkVersion);
			return api.completeOnboarding(headers);
		},
		logKeylessMessage(claimUrl) {
			if (!hasLoggedKeylessMessage) {
				hasLoggedKeylessMessage = true;
				console.log(`[Clerk]: Running in keyless mode. Claim your keys at: ${claimUrl}`);
			}
		},
		async resolveKeysWithKeylessFallback(configuredPublishableKey, configuredSecretKey) {
			let publishableKey = configuredPublishableKey;
			let secretKey = configuredSecretKey;
			let claimUrl;
			let apiKeysUrl;
			try {
				const locallyStoredKeys = safeParseConfig();
				if (Boolean(configuredPublishableKey) && configuredPublishableKey === locallyStoredKeys?.publishableKey && locallyStoredKeys) {
					try {
						await clerkDevelopmentCache?.run(() => this.completeOnboarding(), {
							cacheKey: `${locallyStoredKeys.publishableKey}_complete`,
							onSuccessStale: 1440 * 60 * 1e3
						});
					} catch {}
					clerkDevelopmentCache?.log({
						cacheKey: `${locallyStoredKeys.publishableKey}_claimed`,
						msg: createConfirmationMessage()
					});
					return {
						publishableKey,
						secretKey,
						claimUrl,
						apiKeysUrl
					};
				}
				if (!publishableKey && !secretKey) {
					const keylessApp = await this.getOrCreateKeys();
					if (keylessApp) {
						publishableKey = keylessApp.publishableKey;
						secretKey = keylessApp.secretKey;
						claimUrl = keylessApp.claimUrl;
						apiKeysUrl = keylessApp.apiKeysUrl;
						clerkDevelopmentCache?.log({
							cacheKey: keylessApp.publishableKey,
							msg: createKeylessModeMessage(keylessApp)
						});
					}
				}
			} catch {}
			return {
				publishableKey,
				secretKey,
				claimUrl,
				apiKeysUrl
			};
		}
	};
}
/**
* Resolves Clerk keys, falling back to keyless mode in development if configured keys are missing.
*
* @param configuredPublishableKey - The publishable key from options or environment
* @param configuredSecretKey - The secret key from options or environment
* @param keylessService - The keyless service instance (or null if unavailable)
* @param canUseKeyless - Whether keyless mode is enabled in the current environment
* @returns The resolved keys (either configured or from keyless mode)
*/
async function resolveKeysWithKeylessFallback$1(configuredPublishableKey, configuredSecretKey, keylessService, canUseKeyless) {
	let publishableKey = configuredPublishableKey;
	let secretKey = configuredSecretKey;
	let claimUrl;
	let apiKeysUrl;
	if (!canUseKeyless) return {
		publishableKey,
		secretKey,
		claimUrl,
		apiKeysUrl
	};
	if (!keylessService) return {
		publishableKey,
		secretKey,
		claimUrl,
		apiKeysUrl
	};
	try {
		const locallyStoredKeys = keylessService.readKeys();
		if (Boolean(configuredPublishableKey) && configuredPublishableKey === locallyStoredKeys?.publishableKey && locallyStoredKeys) {
			try {
				await clerkDevelopmentCache?.run(() => keylessService.completeOnboarding(), {
					cacheKey: `${locallyStoredKeys.publishableKey}_complete`,
					onSuccessStale: 1440 * 60 * 1e3
				});
			} catch {}
			clerkDevelopmentCache?.log({
				cacheKey: `${locallyStoredKeys.publishableKey}_claimed`,
				msg: createConfirmationMessage()
			});
			return {
				publishableKey,
				secretKey,
				claimUrl,
				apiKeysUrl
			};
		}
		if (!publishableKey && !secretKey) {
			const keylessApp = await keylessService.getOrCreateKeys();
			if (keylessApp) {
				publishableKey = keylessApp.publishableKey;
				secretKey = keylessApp.secretKey;
				claimUrl = keylessApp.claimUrl;
				apiKeysUrl = keylessApp.apiKeysUrl;
				clerkDevelopmentCache?.log({
					cacheKey: keylessApp.publishableKey,
					msg: createKeylessModeMessage(keylessApp)
				});
			}
		}
	} catch {}
	return {
		publishableKey,
		secretKey,
		claimUrl,
		apiKeysUrl
	};
}
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/server/keyless/fileStorage.js
function createFileStorage(options = {}) {
	const { cwd = () => process.cwd() } = options;
	return createNodeFileStorage(fs, path, {
		cwd,
		frameworkPackageName: "@clerk/tanstack-react-start"
	});
}
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/server/keyless/index.js
var keylessServiceInstance = null;
function keyless() {
	if (!keylessServiceInstance) keylessServiceInstance = createKeylessService({
		storage: createFileStorage(),
		api: {
			async createAccountlessApplication(requestHeaders) {
				try {
					return await clerkClient().__experimental_accountlessApplications.createAccountlessApplication({ requestHeaders });
				} catch {
					return null;
				}
			},
			async completeOnboarding(requestHeaders) {
				try {
					return await clerkClient().__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({ requestHeaders });
				} catch {
					return null;
				}
			}
		},
		framework: "tanstack-react-start"
	});
	return keylessServiceInstance;
}
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/server/keyless/utils.js
function resolveKeysWithKeylessFallback(configuredPublishableKey, configuredSecretKey) {
	return resolveKeysWithKeylessFallback$1(configuredPublishableKey, configuredSecretKey, keyless(), canUseKeyless);
}
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/server/loadOptions.js
var loadOptions = (request, overrides = {}) => {
	const commonEnv = commonEnvs();
	const secretKey = overrides.secretKey || commonEnv.SECRET_KEY;
	const machineSecretKey = overrides.machineSecretKey || commonEnv.MACHINE_SECRET_KEY;
	const publishableKey = overrides.publishableKey || commonEnv.PUBLISHABLE_KEY;
	const jwtKey = overrides.jwtKey || commonEnv.CLERK_JWT_KEY;
	const apiUrl = getEnvVariable("CLERK_API_URL") || apiUrlFromPublishableKey(publishableKey);
	const domain = overrides.domain || commonEnv.DOMAIN;
	const isSatellite = overrides.isSatellite || commonEnv.IS_SATELLITE;
	const relativeOrAbsoluteProxyUrl = overrides.proxyUrl || commonEnv.PROXY_URL;
	const signInUrl = overrides.signInUrl || commonEnv.SIGN_IN_URL;
	const signUpUrl = overrides.signUpUrl || commonEnv.SIGN_UP_URL;
	const satelliteAutoSync = overrides.satelliteAutoSync;
	let proxyUrl;
	if (!!relativeOrAbsoluteProxyUrl && isProxyUrlRelative(relativeOrAbsoluteProxyUrl)) proxyUrl = new URL(relativeOrAbsoluteProxyUrl, request.clerkUrl).toString();
	else proxyUrl = relativeOrAbsoluteProxyUrl;
	if (!secretKey && !canUseKeyless) throw errorThrower.throw("Clerk: no secret key provided");
	if (isSatellite && !proxyUrl && !domain) throw errorThrower.throw("Clerk: satellite mode requires a proxy URL or domain");
	if (isSatellite && secretKey && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(secretKey)) throw errorThrower.throw("Clerk: satellite mode requires a sign-in URL in production");
	return {
		...overrides,
		secretKey,
		machineSecretKey,
		publishableKey,
		jwtKey,
		apiUrl,
		domain,
		isSatellite,
		proxyUrl,
		signInUrl,
		signUpUrl,
		satelliteAutoSync
	};
};
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/server/utils/index.js
var wrapWithClerkState = (data) => {
	return { __internal_clerk_state: { ...data } };
};
function getPrefetchUIFromEnv() {
	if (getEnvVariable("CLERK_PREFETCH_UI") === "false") return false;
}
function getResponseClerkState(requestState, additionalStateOptions = {}) {
	const { reason, message, isSignedIn, ...rest } = requestState;
	return wrapWithClerkState({
		__clerk_ssr_state: rest.toAuth(),
		__publishableKey: requestState.publishableKey,
		__proxyUrl: requestState.proxyUrl,
		__domain: requestState.domain,
		__isSatellite: requestState.isSatellite,
		__signInUrl: requestState.signInUrl,
		__signUpUrl: requestState.signUpUrl,
		__afterSignInUrl: requestState.afterSignInUrl,
		__afterSignUpUrl: requestState.afterSignUpUrl,
		__clerk_debug: debugRequestState(requestState),
		__clerkJSUrl: getEnvVariable("CLERK_JS") || getEnvVariable("CLERK_JS_URL"),
		__clerkJSVersion: getEnvVariable("CLERK_JS_VERSION"),
		__clerkUIUrl: getEnvVariable("CLERK_UI_URL"),
		__clerkUIVersion: getEnvVariable("CLERK_UI_VERSION"),
		__prefetchUI: getPrefetchUIFromEnv(),
		__telemetryDisabled: isTruthy(getEnvVariable("CLERK_TELEMETRY_DISABLED")),
		__telemetryDebug: isTruthy(getEnvVariable("CLERK_TELEMETRY_DEBUG")),
		__signInForceRedirectUrl: additionalStateOptions.signInForceRedirectUrl || getEnvVariable("CLERK_SIGN_IN_FORCE_REDIRECT_URL") || "",
		__signUpForceRedirectUrl: additionalStateOptions.signUpForceRedirectUrl || getEnvVariable("CLERK_SIGN_UP_FORCE_REDIRECT_URL") || "",
		__signInFallbackRedirectUrl: additionalStateOptions.signInFallbackRedirectUrl || getEnvVariable("CLERK_SIGN_IN_FALLBACK_REDIRECT_URL") || "",
		__signUpFallbackRedirectUrl: additionalStateOptions.signUpFallbackRedirectUrl || getEnvVariable("CLERK_SIGN_UP_FALLBACK_REDIRECT_URL") || ""
	});
}
var patchRequest = (request) => {
	const clonedRequest = new Request(request.url, {
		headers: request.headers,
		method: request.method,
		redirect: request.redirect,
		cache: request.cache,
		signal: request.signal
	});
	if (clonedRequest.method !== "GET" && clonedRequest.body !== null && !("duplex" in clonedRequest)) clonedRequest.duplex = "half";
	return clonedRequest;
};
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/server/clerkMiddleware.js
var clerkMiddleware = (options) => {
	return createMiddleware().server(async ({ request, next }) => {
		const clerkRequest = createClerkRequest(patchRequest(request));
		const resolvedOptions = typeof options === "function" ? await options({ url: clerkRequest.clerkUrl }) : options;
		const loadedOptions = loadOptions(clerkRequest, {
			...resolvedOptions,
			publishableKey: resolvedOptions?.publishableKey,
			secretKey: resolvedOptions?.secretKey
		});
		const { publishableKey, secretKey, claimUrl: keylessClaimUrl, apiKeysUrl: keylessApiKeysUrl } = await resolveKeysWithKeylessFallback(loadedOptions.publishableKey, loadedOptions.secretKey);
		if (publishableKey) loadedOptions.publishableKey = publishableKey;
		if (secretKey) loadedOptions.secretKey = secretKey;
		const requestState = await clerkClient().authenticateRequest(clerkRequest, {
			...loadedOptions,
			acceptsToken: "any"
		});
		const locationHeader = requestState.headers.get(constants.Headers.Location);
		if (locationHeader) {
			handleNetlifyCacheInDevInstance({
				locationHeader,
				requestStateHeaders: requestState.headers,
				publishableKey: requestState.publishableKey
			});
			throw new Response(null, {
				status: 307,
				headers: requestState.headers
			});
		}
		if (requestState.status === AuthStatus.Handshake) throw new Error("Clerk: handshake status without redirect");
		const clerkInitialState = getResponseClerkState(requestState, loadedOptions);
		if (canUseKeyless && keylessClaimUrl) clerkInitialState.__internal_clerk_state = {
			...clerkInitialState.__internal_clerk_state,
			__keylessClaimUrl: keylessClaimUrl,
			__keylessApiKeysUrl: keylessApiKeysUrl
		};
		const result = await next({ context: {
			clerkInitialState,
			auth: (opts) => requestState.toAuth(opts)
		} });
		if (requestState.headers) requestState.headers.forEach((value, key) => {
			result.response.headers.append(key, value);
		});
		return result;
	});
};
//#endregion
//#region src/start.ts
var startInstance = createStart(() => {
	return { requestMiddleware: [clerkMiddleware()] };
});
//#endregion
export { startInstance };
