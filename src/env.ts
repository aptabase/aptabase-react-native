import { Platform } from "react-native";
import version from "./version";

// env.PKG_VERSION is replaced by Vite during build phase
const sdkVersion = "aptabase-reactnative@env.PKG_VERSION";

export interface EnvironmentInfo {
  isDebug: boolean;
  locale: string;
  appVersion: string;
  appBuildNumber: string;
  sdkVersion: string;
  osName: string;
  osVersion: string;
}

export function getEnvironmentInfo(): EnvironmentInfo {
  const [osName, osVersion] = getOperatingSystem();

  const locale = "en-US";

  return {
    appVersion: version.appVersion || "",
    appBuildNumber: version.appBuildNumber || "",
    isDebug: __DEV__,
    locale,
    osName,
    osVersion,
    sdkVersion,
  };
}

function getOperatingSystem(): [string, string] {
  switch (Platform.OS) {
    case "android":
      return ["Android", Platform.Version.toString()];
    case "ios":
      if (Platform.isPad) {
        return ["iPadOS", Platform.Version];
      }
      return ["iOS", Platform.Version];
    default:
      return ["", ""];
  }
}
