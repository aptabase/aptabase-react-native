import { newSessionId } from "./session";
import { EnvironmentInfo, getEnvironmentInfo } from "./env";
import { Platform } from "react-native";
import { EventDispatcher } from "./dispatcher";

/**
 * Custom initialization parameters for Aptabase SDK.
 * Use this when calling the init function.
 */
export type AptabaseOptions = {
  // Host URL for Self-Hosted deployments
  host?: string;

  // Custom appVersion to override the default
  appVersion?: string;

  // Override the default flush interval (in milliseconds)
  flushInterval?: string;
};

// Session expires after 1 hour of inactivity
const SESSION_TIMEOUT = 1 * 60 * 60;

const RELEASE_FLUSH_INTERVAL = 60 * 1000;
const DEBUG_FLUSH_INTERVAL = 2 * 1000;

let _sessionId = newSessionId();
let _lastTouched = new Date();
let _appKey = "";
let _apiUrl = "";
let _env: EnvironmentInfo | undefined;
let _dispatcher: EventDispatcher | undefined;

const _hosts: { [region: string]: string } = {
  US: "https://us.aptabase.com",
  EU: "https://eu.aptabase.com",
  DEV: "http://localhost:3000",
  SH: "",
};

function getBaseUrl(
  region: string,
  options?: AptabaseOptions
): string | undefined {
  if (region === "SH") {
    if (!options?.host) {
      console.warn(
        `Host parameter must be defined when using Self-Hosted App Key. Tracking will be disabled.`
      );
      return;
    }
    return options.host;
  }

  return _hosts[region];
}

/**
 * Initializes the SDK with given App Key
 * @param {string} appKey - Aptabase App Key
 * @param {AptabaseOptions} options - Optional initialization parameters
 */
export function init(appKey: string, options?: AptabaseOptions) {
  _appKey = appKey;

  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    console.warn(
      "Aptabase: This SDK is only supported on Android and iOS. Tracking will be disabled."
    );
    return;
  }

  const parts = appKey.split("-");
  if (parts.length !== 3 || _hosts[parts[1]] === undefined) {
    console.warn(
      `Aptabase: App Key "${appKey}" is invalid. Tracking will be disabled.`
    );
    return;
  }

  const baseUrl = getBaseUrl(parts[1], options);
  _apiUrl = `${baseUrl}/api/v0/events`;
  _env = getEnvironmentInfo();

  if (options?.appVersion) {
    _env.appVersion = options.appVersion;
  }

  _dispatcher = new EventDispatcher(_apiUrl, _appKey);

  const flushInterval =
    options?.flushInterval ?? _env.isDebug
      ? DEBUG_FLUSH_INTERVAL
      : RELEASE_FLUSH_INTERVAL;

  setInterval(_dispatcher.flush.bind(_dispatcher), flushInterval);
}

/**
 * Track an event using given properties
 * @param {string} eventName - The name of the event to track
 * @param {Object} props - Optional custom properties
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (!_dispatcher || !_env) return;

  let now = new Date();
  const diffInMs = now.getTime() - _lastTouched.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  if (diffInSec > SESSION_TIMEOUT) {
    _sessionId = newSessionId();
  }
  _lastTouched = now;

  _dispatcher.enqueue({
    timestamp: new Date().toISOString(),
    sessionId: _sessionId,
    eventName: eventName,
    systemProps: {
      isDebug: _env.isDebug,
      locale: _env.locale,
      osName: _env.osName,
      osVersion: _env.osVersion,
      appVersion: _env.appVersion,
      sdkVersion: _env.sdkVersion,
    },
    props: props,
  });
}
