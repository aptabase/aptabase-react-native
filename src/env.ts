import {Platform} from 'react-native';

// env.PKG_VERSION is replaced by Vite during build phase
const sdkVersion = "aptabase-reactnative@env.PKG_VERSION";

export interface EnvironmentInfo {
  isDebug: boolean;
  locale: string;
  appVersion: string;
  sdkVersion: string;
  osName: String;
  osVersion: String;
}

export function getEnvironmentInfo(): EnvironmentInfo {
  const [osName, osVersion] = getOperatingSystem();

  const locale = "en-US";

  return {
    appVersion: "1.0.0",
    isDebug: __DEV__,
    locale,
    osName,
    osVersion,
    sdkVersion,
  };
}

function getOperatingSystem(): [string, string] {
  switch (Platform.OS) {
    case 'android':
      return ['Android', Platform.Version.toString()];
    case 'ios':
      if (Platform.isPad) {
        return ['iPadOS', Platform.Version];
      }  
      return ['iOS', Platform.Version];
    default:
      return ['', ''];
  }
}