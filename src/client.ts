import type { Platform } from "react-native";
import type { AptabaseOptions } from "./types";
import type { EnvironmentInfo } from "./env";
import { EventDispatcher } from "./dispatcher";
import { newSessionId } from "./session";
import { HOSTS, SESSION_TIMEOUT } from "./constants";

export class AptabaseClient {
  private readonly _dispatcher: EventDispatcher;
  private readonly _env: EnvironmentInfo;
  private _sessionId = newSessionId();
  private _lastTouched = new Date();
  private _flushTimer: number | undefined;

  constructor(appKey: string, env: EnvironmentInfo, options?: AptabaseOptions) {
    const [_, region] = appKey.split("-");
    const baseUrl = this.getBaseUrl(region, options);

    if (options?.appVersion) {
      env.appVersion = options.appVersion;
    }

    this._env = env;
    this._dispatcher = new EventDispatcher(appKey, baseUrl, env);
  }

  public trackEvent(
    eventName: string,
    props?: Record<string, string | number | boolean>
  ) {
    this._dispatcher.enqueue({
      timestamp: new Date().toISOString(),
      sessionId: this.evalSessionId(),
      eventName: eventName,
      systemProps: {
        isDebug: this._env.isDebug,
        locale: this._env.locale,
        osName: this._env.osName,
        osVersion: this._env.osVersion,
        appVersion: this._env.appVersion,
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

  public flush() {
    this._dispatcher.flush();
  }

  private evalSessionId() {
    let now = new Date();
    const diffInMs = now.getTime() - this._lastTouched.getTime();
    const diffInSec = Math.floor(diffInMs / 1000);
    if (diffInSec > SESSION_TIMEOUT) {
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
