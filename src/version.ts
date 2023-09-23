import { NativeModules } from "react-native";

const { RNAptabaseModule } = NativeModules;

type VersionObject = {
  appVersion: string;
  appBuildNumber: string;
};

const Version: VersionObject = {
  appVersion: RNAptabaseModule?.appVersion?.toString() ?? "",
  appBuildNumber: RNAptabaseModule?.appBuildNumber?.toString() ?? "",
};

export default Version;
