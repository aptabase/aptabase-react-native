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

  // Enable tracking for web platform (disabled by default)
  enableWeb?: boolean;

  // Automatically report uncaught errors and crashes (disabled by default)
  enableCrashReporting?: boolean;
};

/**
 * Severity of a reported error: "fatal" for errors the app cannot recover from.
 */
export type ErrorSeverity = "fatal" | "error";

/**
 * How the error was captured: "handled" (manual trackError), "unhandled" or
 * "crash" (automatic crash reporting), "taskException" (async task failures).
 */
export type ErrorKind = "crash" | "unhandled" | "taskException" | "handled";

/**
 * Optional parameters for the trackError function.
 */
export type TrackErrorOptions = {
  // Report the error as fatal (severity "fatal", kind "crash"). Defaults to false.
  fatal?: boolean;
};

/**
 * An error report sent to the error ingestion endpoint (one object per request).
 */
export type ErrorReport = {
  errorMessage: string;
  errorType: string;
  stackTrace?: string;
  timestamp: string;
  sessionId: string;
  platform: string;
  osName?: string;
  osVersion?: string;
  appVersion?: string;
  sdkVersion?: string;
  severity: ErrorSeverity;
  kind: ErrorKind;
  isDebug: boolean;
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
    osName: string | undefined;
    osVersion: string | undefined;
    appVersion: string;
    appBuildNumber: string;
    sdkVersion: string;
  };
  props?: Record<string, string | number | boolean>;
};
