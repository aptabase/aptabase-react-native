import type { ErrorKind, ErrorReport, ErrorSeverity } from "./types";
import type { EnvironmentInfo } from "./env";
import { ERROR_PLATFORM } from "./constants";

// Field limits enforced by the error ingestion endpoint; exceeding any of them
// rejects the whole report with 400, so values are truncated at capture time
const MAX_ERROR_MESSAGE = 5000;
const MAX_ERROR_TYPE = 100;
const MAX_STACK_TRACE = 10000;
const MAX_OS_NAME = 30;
const MAX_OS_VERSION = 100;
const MAX_APP_VERSION = 50;
const MAX_SDK_VERSION = 40;

/**
 * Normalizes any thrown value into an error shape.
 * Non-Error values (strings, numbers, objects) are stringified.
 */
export function normalizeError(error: unknown): {
  name: string;
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: error.message,
      stack: error.stack,
    };
  }

  return { name: "Error", message: safeString(error) };
}

/**
 * Builds an error report from a thrown value, stamping the timestamp and
 * session at capture time so retried sends keep their original attribution.
 */
export function buildErrorReport(
  error: unknown,
  severity: ErrorSeverity,
  kind: ErrorKind,
  sessionId: string,
  env: EnvironmentInfo
): ErrorReport {
  const { name, message, stack } = normalizeError(error);
  const prefix = severity === "fatal" ? "Fatal " : "";

  return {
    errorMessage: truncate(`${prefix}${name}: ${message}`, MAX_ERROR_MESSAGE),
    errorType: truncate(name, MAX_ERROR_TYPE),
    stackTrace: stack ? truncate(stack, MAX_STACK_TRACE) : undefined,
    timestamp: new Date().toISOString(),
    sessionId,
    platform: ERROR_PLATFORM,
    // Unlike the events endpoint, the error endpoint does not infer the OS
    // from the User-Agent, so osName/osVersion are sent on all platforms
    osName: env.osName ? truncate(env.osName, MAX_OS_NAME) : undefined,
    osVersion: env.osVersion
      ? truncate(env.osVersion, MAX_OS_VERSION)
      : undefined,
    appVersion: env.appVersion
      ? truncate(env.appVersion, MAX_APP_VERSION)
      : undefined,
    sdkVersion: truncate(env.sdkVersion, MAX_SDK_VERSION),
    severity,
    kind,
    isDebug: env.isDebug,
  };
}

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? value.slice(0, maxLength) : value;

const safeString = (value: unknown) => {
  try {
    return String(value);
  } catch {
    return "[unserializable error]";
  }
};
