import type { ErrorReport } from "./types";
import type { EnvironmentInfo } from "./env";
import { MAX_ERROR_QUEUE_SIZE } from "./constants";

// Errors have their own dispatcher because the error endpoint takes a single
// object per request and has different retry semantics than the events
// endpoint: 408/429 must be retried, while 403 (monthly error quota
// exhausted) must never be retried.
export abstract class ErrorDispatcher {
  protected _reports: ErrorReport[] = [];
  protected headers: Headers;
  protected apiUrl: string;
  private _pending: Promise<void> = Promise.resolve();

  constructor(appKey: string, baseUrl: string, env: EnvironmentInfo) {
    this.apiUrl = `${baseUrl}/api/v0/error`;
    this.headers = new Headers({
      "Content-Type": "application/json",
      "App-Key": appKey,
      "User-Agent": `${env.osName}/${env.osVersion} ${env.locale}`,
    });
  }

  public abstract enqueue(report: ErrorReport): void;

  // Flushes are chained so a poll-timer flush can never race an
  // enqueue-triggered one into double-sending the same report
  public flush(): Promise<void> {
    this._pending = this._pending.then(() => this._flushQueue());
    return this._pending;
  }

  private async _flushQueue(): Promise<void> {
    const reports = this._reports.splice(0, this._reports.length);
    const failed: ErrorReport[] = [];

    for (const report of reports) {
      const settled = await this._send(report);
      if (!settled) {
        failed.push(report);
      }
    }

    if (failed.length > 0) {
      this._reports.unshift(...failed);
    }
  }

  // Returns true when the report is settled (delivered or dropped) and
  // false when it should be kept for a retry on a later flush
  protected async _send(report: ErrorReport): Promise<boolean> {
    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: this.headers,
        credentials: "omit",
        body: JSON.stringify(report),
      });

      if (res.ok) {
        return true;
      }

      const reason = `${res.status} ${await res.text()}`;

      // The server reports an exhausted monthly error quota as 403 (not 429)
      // precisely so clients drop the report instead of retrying it
      if (res.status === 403) {
        console.warn(
          `Aptabase: Error report rejected because of ${reason}. Will not retry.`
        );
        return true;
      }

      if (res.status === 408 || res.status === 429 || res.status >= 500) {
        console.warn(
          `Aptabase: Failed to send error report because of ${reason}. Will retry later.`
        );
        return false;
      }

      console.warn(
        `Aptabase: Failed to send error report because of ${reason}. Will not retry.`
      );
      return true;
    } catch (e) {
      console.error(`Aptabase: Failed to send error report. Reason: ${e}`);
      return false;
    }
  }
}

export class NativeErrorDispatcher extends ErrorDispatcher {
  public enqueue(report: ErrorReport): void {
    if (this._reports.length >= MAX_ERROR_QUEUE_SIZE) {
      console.warn("Aptabase: Error report queue is full. Dropping report.");
      return;
    }

    this._reports.push(report);

    // Errors are high-value: attempt delivery right away instead of waiting
    // for the next poll tick; failures stay queued for the regular flushes.
    // Only the first report of a batch kicks a flush — the flush drains the
    // whole queue, so reports enqueued while it is pending ride along
    if (this._reports.length === 1) {
      void this.flush().catch(() => undefined);
    }
  }
}

export class WebErrorDispatcher extends ErrorDispatcher {
  constructor(appKey: string, baseUrl: string, env: EnvironmentInfo) {
    super(appKey, baseUrl, env);
    this.headers = new Headers({
      "Content-Type": "application/json",
      "App-Key": appKey,
      // No User-Agent header for web
    });
  }

  // No polling runs on web, so reports are sent immediately and never queued
  public enqueue(report: ErrorReport): void {
    void this._send(report).catch(() => undefined);
  }
}
