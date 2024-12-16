import type { Event } from "./types";
import type { EnvironmentInfo } from "./env";

export abstract class EventDispatcher {
  protected _events: Event[] = [];
  protected MAX_BATCH_SIZE = 25;
  protected headers: Headers;
  protected apiUrl: string;

  constructor(appKey: string, baseUrl: string, env: EnvironmentInfo) {
    this.apiUrl = `${baseUrl}/api/v0/events`;
    this.headers = new Headers({
      "Content-Type": "application/json",
      "App-Key": appKey,
      "User-Agent": `${env.osName}/${env.osVersion} ${env.locale}`,
    });
  }

  public abstract enqueue(evt: Event | Event[]): void;

  public async flush(): Promise<void> {
    if (this._events.length === 0) {
      return Promise.resolve();
    }

    let failedEvents: Event[] = [];
    do {
      const eventsToSend = this._events.splice(0, this.MAX_BATCH_SIZE);
      try {
        await this._sendEvents(eventsToSend);
      } catch {
        failedEvents = [...failedEvents, ...eventsToSend];
      }
    } while (this._events.length > 0);

    if (failedEvents.length > 0) {
      this.enqueue(failedEvents);
    }
  }

  protected async _sendEvents(events: Event[]): Promise<void> {
    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: this.headers,
        credentials: "omit",
        body: JSON.stringify(events),
      });

      if (res.ok) {
        return Promise.resolve();
      }

      const reason = `${res.status} ${await res.text()}`;
      if (res.status < 500) {
        console.warn(
          `Aptabase: Failed to send ${events.length} events because of ${reason}. Will not retry.`
        );
        return Promise.resolve();
      }

      throw new Error(reason);
    } catch (e) {
      console.error(
        `Aptabase: Failed to send ${events.length} events. Reason: ${e}`
      );
      throw e;
    }
  }

  protected async _sendEvent(event: Event): Promise<void> {
    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: this.headers,
        credentials: "omit",
        body: JSON.stringify(event),
      });

      if (res.ok) {
        return Promise.resolve();
      }

      const reason = `${res.status} ${await res.text()}`;
      if (res.status < 500) {
        console.warn(
          `Aptabase: Failed to send event because of ${reason}. Will not retry.`
        );
        return Promise.resolve();
      }

      throw new Error(reason);
    } catch (e) {
      console.error(`Aptabase: Failed to send event. Reason: ${e}`);
      throw e;
    }
  }
}

export class WebEventDispatcher extends EventDispatcher {
  constructor(appKey: string, baseUrl: string, env: EnvironmentInfo) {
    super(appKey, baseUrl, env);
    this.apiUrl = `${baseUrl}/api/v0/event`;
    this.headers = new Headers({
      "Content-Type": "application/json",
      "App-Key": appKey,
      // No User-Agent header for web
    });
  }

  public enqueue(evt: Event | Event[]): void {
    if (Array.isArray(evt)) {
      evt.forEach((event) => this._sendEvent(event));
    } else {
      this._sendEvent(evt);
    }
  }
}

export class NativeEventDispatcher extends EventDispatcher {
  constructor(appKey: string, baseUrl: string, env: EnvironmentInfo) {
    super(appKey, baseUrl, env);
    this.apiUrl = `${baseUrl}/api/v0/events`;
  }

  public enqueue(evt: Event | Event[]): void {
    if (Array.isArray(evt)) {
      this._events.push(...evt);
    } else {
      this._events.push(evt);
    }
  }
}
