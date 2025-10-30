import { NativeModules } from "react-native";

const { RNAptabaseModule } = NativeModules;

type VersionObject = {
  appVersion: string;
  appBuildNumber: string;
  isiOSAppOnMac: boolean;
};

const Version: VersionObject = {
  appVersion: RNAptabaseModule?.appVersion?.toString() ?? "",
  appBuildNumber: RNAptabaseModule?.appBuildNumber?.toString() ?? "",
  isiOSAppOnMac: RNAptabaseModule?.isiOSAppOnMac ?? false,
};

export default Version;
