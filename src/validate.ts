import type { Platform } from "react-native";
import { HOSTS } from "./constants";

import type { AptabaseOptions } from "./types";

const SUPPORTED_PLATFORMS = ["android", "ios", "web"];

export function validate(
  platform: typeof Platform.OS,
  appKey: string,
  options?: AptabaseOptions
): [boolean, string] {
  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    return [false, "This SDK is only supported on Android, iOS and web"];
  }

  const parts = appKey.split("-");
  if (parts.length !== 3 || HOSTS[parts[1]] === undefined) {
    return [false, `App Key "${appKey}" is invalid`];
  }

  if (parts[1] === "SH" && !options?.host) {
    return [
      false,
      `Host parameter must be defined when using Self-Hosted App Key`,
    ];
  }

  // If platform is web but web tracking is not enabled, log a warning
  if (platform === "web" && !options?.enableWeb) {
    console.warn(
      "Aptabase: Web tracking is disabled by default. Set enableWeb: true in options to enable it."
    );
  }

  return [true, ""];
}
