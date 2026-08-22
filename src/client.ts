import type {
  AptabaseOptions,
  ErrorKind,
  ErrorSeverity,
  TrackErrorOptions,
} from "./types";
import type { EnvironmentInfo } from "./env";
import { NativeEventDispatcher, WebEventDispatcher } from "./dispatcher";
import { NativeErrorDispatcher, WebErrorDispatcher } from "./error-dispatcher";
import { buildErrorReport } from "./error-report";
import { newSessionId } from "./session";
import { HOSTS, SESSION_TIMEOUT } from "./constants";

export class AptabaseClient {
  private readonly _dispatcher:
    | WebEventDispatcher
    | NativeEventDispatcher
    | null;
  private readonly _errorDispatcher:
    | WebErrorDispatcher
    | NativeErrorDispatcher
    | null;
  private readonly _env: EnvironmentInfo;
  private _sessionId = newSessionId();
  private _lastTouched = new Date();
  private _flushTimer: NodeJS.Timeout | undefined;

  constructor(appKey: string, env: EnvironmentInfo, options?: AptabaseOptions) {
    const [_, region] = appKey.split("-");
    const baseUrl = this.getBaseUrl(region, options);

    this._env = { ...env };
    if (options?.appVersion) {
      this._env.appVersion = options.appVersion;
    }
    if (typeof options?.isDebug === "boolean") {
      this._env.isDebug = options.isDebug;
    }

    const isWeb = this._env.osName === "web";
    const isWebTrackingEnabled = isWeb && options?.enableWeb === true;

    const shouldEnableTracking = !isWeb || isWebTrackingEnabled;
    const dispatcher = shouldEnableTracking
      ? isWeb
        ? new WebEventDispatcher(appKey, baseUrl, env)
        : new NativeEventDispatcher(appKey, baseUrl, env)
      : null;

    this._dispatcher = dispatcher;
    this._errorDispatcher = shouldEnableTracking
      ? isWeb
        ? new WebErrorDispatcher(appKey, baseUrl, env)
        : new NativeErrorDispatcher(appKey, baseUrl, env)
      : null;
  }

  public trackEvent(
    eventName: string,
    props?: Record<string, string | number | boolean>
  ) {
    if (!this._dispatcher) return;

    const isWeb = this._env.osName === "web";

    this._dispatcher.enqueue({
      timestamp: new Date().toISOString(),
      sessionId: this.evalSessionId(),
      eventName: eventName,
      systemProps: {
        isDebug: this._env.isDebug,
        locale: this._env.locale,
        osName: isWeb ? undefined : this._env.osName,
        osVersion: isWeb ? undefined : this._env.osVersion,
        appVersion: this._env.appVersion,
        appBuildNumber: this._env.appBuildNumber,
        sdkVersion: this._env.sdkVersion,
      },
      props: props,
    });
  }

  public trackError(error: unknown, options?: TrackErrorOptions) {
    const fatal = options?.fatal === true;
    this.trackErrorInternal(
      error,
      fatal ? "fatal" : "error",
      fatal ? "crash" : "handled"
    );
  }

  // Richer entry point used by the crash reporter to convey how the error
  // was captured ("crash", "unhandled") without widening the public API
  public trackErrorInternal(
    error: unknown,
    severity: ErrorSeverity,
    kind: ErrorKind
  ) {
    if (!this._errorDispatcher) return;

    const report = buildErrorReport(
      error,
      severity,
      kind,
      this.evalSessionId(),
      this._env
    );

    this._errorDispatcher.enqueue(report);
  }

  public startPolling(flushInterval: number) {
    if (!(this._dispatcher instanceof NativeEventDispatcher)) {
      return;
    }

    this.stopPolling();

    this._flushTimer = setInterval(this.flush.bind(this), flushInterval);
  }

  public stopPolling() {
    if (this._flushTimer) {
      clearInterval(this._flushTimer);
      this._flushTimer = undefined;
    }
  }

  public flush(): Promise<void> {
    return Promise.all([
      this._dispatcher?.flush(),
      this._errorDispatcher?.flush(),
    ]).then(() => undefined);
  }

  private evalSessionId() {
    let now = new Date();
    const diffInMs = now.getTime() - this._lastTouched.getTime();
    if (diffInMs > SESSION_TIMEOUT) {
      this._sessionId = newSessionId();
    }
    this._lastTouched = now;

    return this._sessionId;
  }

  private getBaseUrl(region: string, options?: AptabaseOptions): string {
    if (region === "SH") {
      return options?.host ?? HOSTS.DEV;
    }

    return HOSTS[region];
  }
}
