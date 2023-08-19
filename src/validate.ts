import type { Platform } from "react-native";
import { HOSTS } from "./constants";

import type { AptabaseOptions } from "./types";

export function validate(
  platform: typeof Platform.OS,
  appKey: string,
  options?: AptabaseOptions
): [boolean, string] {
  if (platform !== "android" && platform !== "ios") {
    return [false, "This SDK is only supported on Android and iOS."];
  }

  const parts = appKey.split("-");
  if (parts.length !== 3 || HOSTS[parts[1]] === undefined) {
    return [false, `App Key "${appKey}" is invalid`];
  }

  if (parts[1] === "SH" && !options?.host) {
    return [
      false,
      `Host parameter must be defined when using Self-Hosted App Key.`,
    ];
  }

  return [true, ""];
}
