import type { ErrorUtils } from "react-native";
import type { AptabaseClient } from "./client";

// How long a fatal error is given to leave the device before chaining to the
// default handler, which terminates the process in release builds
const FATAL_FLUSH_TIMEOUT = 2000;

/**
 * Reports uncaught JS errors through the global error handler.
 *
 * Limitations:
 * - Errors caught by React Error Boundaries never reach the global handler;
 *   call trackError from the boundary instead.
 * - Native (non-JS) crashes are not captured.
 * - In development, fatal errors show the RedBox instead of crashing, so
 *   reports marked "crash" in debug data are soft crashes.
 *
 * Returns a function that unregisters the handler.
 */
export function registerCrashReporting(client: AptabaseClient): () => void {
  // React Native sets global.ErrorUtils at runtime, but its types export no
  // ambient global declaration; missing means a non-RN runtime (e.g. web)
  const errorUtils = (globalThis as { ErrorUtils?: ErrorUtils }).ErrorUtils;
  if (!errorUtils?.getGlobalHandler || !errorUtils.setGlobalHandler) {
    return () => undefined;
  }

  const previous = errorUtils.getGlobalHandler();
  let active = true;

  const handler = (error: unknown, isFatal?: boolean) => {
    const fatal = isFatal === true;

    if (active) {
      client.trackErrorInternal(
        error,
        fatal ? "fatal" : "error",
        fatal ? "crash" : "unhandled"
      );
    }

    if (!previous) return;

    // In release builds the default handler terminates the process, so give
    // the report a bounded window to be sent before chaining to it. In
    // development the RedBox should show instantly and nothing terminates,
    // so the in-flight request completes anyway.
    if (fatal && active && !__DEV__) {
      const chain = () => previous(error, isFatal);
      const timeout = new Promise<void>((resolve) =>
        setTimeout(resolve, FATAL_FLUSH_TIMEOUT)
      );
      void Promise.race([client.flush(), timeout]).then(chain, chain);
      return;
    }

    previous(error, isFatal);
  };

  errorUtils.setGlobalHandler(handler);

  return () => {
    active = false;
    // Restore only if we are still the registered handler; otherwise leave
    // the chain intact for whoever registered on top of us
    if (errorUtils.getGlobalHandler() === handler) {
      errorUtils.setGlobalHandler(previous);
    }
  };
}
