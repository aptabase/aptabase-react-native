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
    sdkVersion: string;
  };
  props?: Record<string, string | number | boolean>;
};

export class EventDispatcher {
  private _events: Event[] = [];
  private MAX_BATCH_SIZE = 25;

  constructor(private apiUrl: string, private appKey: string) {}

  public enqueue(evt: Event | Event[]) {
    if (Array.isArray(evt)) {
      this._events.push(...evt);
      return;
    }

    this._events.push(evt);
  }

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

  private async _sendEvents(events: Event[]): Promise<void> {
    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "App-Key": this.appKey,
        },
        credentials: "omit",
        body: JSON.stringify(events),
      });

      if (res.status < 300) {
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
}
