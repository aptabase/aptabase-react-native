import type { AptabaseOptions } from "./types";
import { getEnvironmentInfo } from "./env";
import { AppState, Platform } from "react-native";
import { AptabaseClient } from "./client";
import { FLUSH_INTERVAL } from "./constants";
import { validate } from "./validate";

let _client: AptabaseClient | undefined;

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

  const env = getEnvironmentInfo();
  _client = new AptabaseClient(appKey, env, options);

  const flushInterval = options?.flushInterval ?? FLUSH_INTERVAL;
  _client.startPolling(flushInterval);

  if (!AppState.isAvailable) return;

  AppState.addEventListener("change", (next) => {
    _client?.stopPolling();

    switch (next) {
      case "active":
        _client?.startPolling(flushInterval);
        break;

      case "background":
        _client?.flush();
        break;
    }
  });
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
  _client?.trackEvent(eventName, props);
}
