import type { AptabaseOptions } from "./types";
import type { EnvironmentInfo } from "./env";
import { NativeEventDispatcher, WebEventDispatcher } from "./dispatcher";
import { newSessionId } from "./session";
import { HOSTS, SESSION_TIMEOUT } from "./constants";

export class AptabaseClient {
  private readonly _dispatcher:
    | WebEventDispatcher
    | NativeEventDispatcher
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

    const isWeb = this._env.osName === "web";
    const isWebTrackingEnabled = isWeb && options?.enableWeb === true;

    const shouldEnableTracking = !isWeb || isWebTrackingEnabled;
    const dispatcher = shouldEnableTracking
      ? isWeb
        ? new WebEventDispatcher(appKey, baseUrl, env)
        : new NativeEventDispatcher(appKey, baseUrl, env)
      : null;

    this._dispatcher = dispatcher;
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

  public startPolling(flushInterval: number) {
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
    if (!this._dispatcher) return Promise.resolve();
    return this._dispatcher.flush();
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
