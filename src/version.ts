
import { NativeModules } from 'react-native';

const { RNAptabaseModule } = NativeModules;

type VersionObject = {
  appVersion: string | undefined,
  appBuildNumber: string | undefined,
};

const Version: VersionObject = {
  appVersion: RNAptabaseModule && RNAptabaseModule.appVersion,
  appBuildNumber: RNAptabaseModule && RNAptabaseModule.appBuildNumber,
};

export default Version;