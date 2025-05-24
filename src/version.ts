import { Platform, NativeModules } from "react-native";

type VersionObject = {
  appVersion: string;
  appBuildNumber: string;
};

let Version: VersionObject;

if (Platform.OS === "web") {
  Version = {
    appVersion: "", // can be overrided in AptabaseOptions
    appBuildNumber: "",
  };
} else {
  const { RNAptabaseModule } = NativeModules;
  Version = {
    appVersion: RNAptabaseModule?.appVersion?.toString() ?? "",
    appBuildNumber: RNAptabaseModule?.appBuildNumber?.toString() ?? "",
  };
}

export default Version;
