import { Platform } from "react-native";
import version from "./version";

// env.PKG_VERSION is replaced by Vite during build phase
const sdkVersion = `aptabase-reactnative@${process.env.PKG_VERSION}`;

export interface EnvironmentInfo {
  isDebug: boolean;
  locale: string;
  appVersion: string;
  appBuildNumber: string;
  sdkVersion: string;
  osName: string | undefined;
  osVersion: string | undefined;
}

export function getEnvironmentInfo(): EnvironmentInfo {
  const [osName, osVersion] = getOperatingSystem();

  const locale = "en-US";

  const envInfo: EnvironmentInfo = {
    appVersion: version.appVersion,
    appBuildNumber: version.appBuildNumber,
    isDebug: __DEV__,
    locale,
    osName: osName,
    osVersion: osVersion,
    sdkVersion,
  };

  return envInfo;

  function getOperatingSystem(): [string, string] {
    switch (Platform.OS) {
      case "android":
        return ["Android", Platform.constants.Release];
      case "ios":
        if (Platform.isPad) {
          return ["iPadOS", Platform.Version];
        }
        return ["iOS", Platform.Version];
      // Web needs to be empty as the server computes these values using the user agent
      default:
        return ["", ""];
    }
  }
}
