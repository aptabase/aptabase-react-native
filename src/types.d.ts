/**
 * Custom initialization parameters for Aptabase SDK.
 * Use this when calling the init function.
 */
export type AptabaseOptions = {
  // Host URL for Self-Hosted deployments
  host?: string;

  // Custom appVersion to override the default
  appVersion?: string;

  // Override the default flush interval (in milliseconds)
  flushInterval?: number;
};

/**
 * A tracked event instance representing something that happened in the app.
 */
export type Event = {
  timestamp: string;
  sessionId: string;
  eventName: string;
  systemProps: {
    isDebug: boolean;
    locale: string;
    osName: string;
    osVersion: string;
    appVersion: string;
    appBuildNumber: string;
    sdkVersion: string;
  };
  props?: Record<string, string | number | boolean>;
};
