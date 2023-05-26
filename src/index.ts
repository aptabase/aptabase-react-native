import { newSessionId } from "./session";
import { EnvironmentInfo, getEnvironmentInfo } from "./env";
import { Platform } from "react-native";

export type AptabaseOptions = {
  host?: string;
  appVersion?: string;
};

// Session expires after 1 hour of inactivity
const SESSION_TIMEOUT = 1 * 60 * 60;
let _sessionId = newSessionId();
let _lastTouched = new Date();
let _appKey = "";
let _apiUrl = "";
let _env: EnvironmentInfo | undefined;

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

export function init(appKey: string, options?: AptabaseOptions) {
  _appKey = appKey;

  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
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
  _apiUrl = `${baseUrl}/api/v0/event`;
  _env = getEnvironmentInfo();
}

export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (!_appKey || !_env) return;

  let now = new Date();
  const diffInMs = now.getTime() - _lastTouched.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  if (diffInSec > SESSION_TIMEOUT) {
    _sessionId = newSessionId();
  }
  _lastTouched = now;

  const body = JSON.stringify({
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

  fetch(_apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "App-Key": _appKey,
    },
    credentials: "omit",
    body,
  })
    .then((res) => {
      if (res.status >= 300) {
        console.warn(
          `Aptabase: Failed to send event "${eventName}": ${res.status} ${res.statusText}`
        );
      }
    })
    .catch(console.error);
}
