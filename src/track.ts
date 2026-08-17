import type { AptabaseOptions, TrackErrorOptions } from "./types";
import { getEnvironmentInfo } from "./env";
import {
  AppState,
  Platform,
  type NativeEventSubscription,
} from "react-native";
import { AptabaseClient } from "./client";
import { registerCrashReporting } from "./crash-reporting";
import { FLUSH_INTERVAL } from "./constants";
import { validate } from "./validate";

let _client: AptabaseClient | undefined;
let _appStateSubscription: NativeEventSubscription | undefined;
let _unregisterCrashReporting: (() => void) | undefined;

/**
 * Initializes the SDK with given App Key
 * @param {string} appKey - Aptabase App Key
 * @param {AptabaseOptions} options - Optional initialization parameters
 */
export function init(appKey: string, options?: AptabaseOptions) {
  const [ok, msg] = validate(Platform.OS, appKey, options);
  if (!ok) {
    console.warn(`Aptabase: ${msg}. Tracking will be disabled.`);
    return;
  }

  // init may be called more than once (e.g. from a re-rendered provider),
  // so tear down whatever a previous call registered
  removeListeners();

  const env = getEnvironmentInfo();
  _client = new AptabaseClient(appKey, env, options);

  const flushInterval = options?.flushInterval ?? FLUSH_INTERVAL;
  _client.startPolling(flushInterval);

  if (options?.enableCrashReporting) {
    _unregisterCrashReporting = registerCrashReporting(_client);
  }

  if (!AppState.isAvailable) return;

  _appStateSubscription = AppState.addEventListener("change", (next) => {
    _client?.flush();

    if (next === "active") {
      _client?.startPolling(flushInterval);
    } else {
      _client?.stopPolling();
    }
  });
}

/**
 * Dispose the SDK and stop tracking events
 */
export function dispose() {
  removeListeners();

  if (_client) {
    _client.stopPolling();
    _client = undefined;
  } else {
    console.warn(`Aptabase: dispose was called but SDK was not initialized.`);
  }
}

function removeListeners() {
  _unregisterCrashReporting?.();
  _unregisterCrashReporting = undefined;
  _appStateSubscription?.remove();
  _appStateSubscription = undefined;
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
  if (!!props && !isPlainObject(props)) {
    console.warn(
      `Aptabase: trackEvent was called with invalid properties. The second parameter must be an object.`
    );
    return;
  }

  _client?.trackEvent(eventName, props);
}

/**
 * Track an error or exception
 * @param {unknown} error - The error to track, usually an Error instance
 * @param {TrackErrorOptions} options - Optional parameters, set fatal to true for errors the app cannot recover from
 */
export function trackError(error: unknown, options?: TrackErrorOptions) {
  _client?.trackError(error, options);
}

const isPlainObject = (val: any) =>
  typeof val === "object" && val.constructor === Object;
