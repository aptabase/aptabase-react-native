import "vitest-fetch-mock";
import { NativeErrorDispatcher, WebErrorDispatcher } from "./error-dispatcher";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EnvironmentInfo } from "./env";
import type { ErrorReport } from "./types";

const env: EnvironmentInfo = {
  isDebug: false,
  locale: "en-US",
  osName: "iOS",
  osVersion: "14.3",
  appVersion: "1.0.0",
  appBuildNumber: "1",
  sdkVersion: "aptabase-reactnative@1.0.0",
};

const createReport = (errorMessage: string): ErrorReport => ({
  errorMessage,
  errorType: "Error",
  timestamp: new Date().toISOString(),
  sessionId: "123",
  platform: "React Native",
  osName: env.osName,
  osVersion: env.osVersion,
  appVersion: env.appVersion,
  sdkVersion: env.sdkVersion,
  severity: "error",
  kind: "handled",
  isDebug: env.isDebug,
});

const expectRequestCount = (count: number) => {
  expect(fetchMock.requests().length).toEqual(count);
};

describe("NativeErrorDispatcher", () => {
  let dispatcher: NativeErrorDispatcher;

  beforeEach(() => {
    dispatcher = new NativeErrorDispatcher(
      "A-DEV-000",
      "https://localhost:3000",
      env
    );
    fetchMock.resetMocks();
  });

  it("should not send a request if queue is empty", async () => {
    await dispatcher.flush();

    expectRequestCount(0);
  });

  it("should attempt delivery immediately on enqueue", async () => {
    dispatcher.enqueue(createReport("boom"));

    await vi.waitFor(() => expectRequestCount(1));
  });

  it("should send report with correct headers and a single object body", async () => {
    dispatcher.enqueue(createReport("boom"));
    await dispatcher.flush();

    const request = fetchMock.requests().at(0);
    expect(request).not.toBeUndefined();
    expect(request?.url).toEqual("https://localhost:3000/api/v0/error");
    expect(request?.headers.get("Content-Type")).toEqual("application/json");
    expect(request?.headers.get("App-Key")).toEqual("A-DEV-000");
    expect(request?.headers.get("User-Agent")).toEqual("iOS/14.3 en-US");

    const body = await request?.json();
    expect(Array.isArray(body)).toBe(false);
    expect(body.errorMessage).toEqual("boom");
  });

  it("should not send a report again after it was accepted", async () => {
    fetchMock.mockResponseOnce("", { status: 202 });

    dispatcher.enqueue(createReport("boom"));
    await dispatcher.flush();
    expectRequestCount(1);

    await dispatcher.flush();
    expectRequestCount(1);
  });

  it("should send one request per report", async () => {
    dispatcher.enqueue(createReport("boom1"));
    dispatcher.enqueue(createReport("boom2"));
    await dispatcher.flush();

    expectRequestCount(2);
    const body1 = await fetchMock.requests().at(0)?.json();
    const body2 = await fetchMock.requests().at(1)?.json();
    expect(body1.errorMessage).toEqual("boom1");
    expect(body2.errorMessage).toEqual("boom2");
  });

  it.each([[500], [503], [429], [408]])(
    "should retry reports that failed with %i in a subsequent flush",
    async (status) => {
      fetchMock.mockResponseOnce("{}", { status });

      dispatcher.enqueue(createReport("boom"));
      await dispatcher.flush();

      expectRequestCount(2);
      const body = await fetchMock.requests().at(1)?.json();
      expect(body.errorMessage).toEqual("boom");

      await dispatcher.flush();
      expectRequestCount(2);
    }
  );

  it("should retry reports that failed with a network error", async () => {
    fetchMock.mockRejectOnce(new Error("network down"));

    dispatcher.enqueue(createReport("boom"));
    await dispatcher.flush();

    expectRequestCount(2);

    await dispatcher.flush();
    expectRequestCount(2);
  });

  it("should not retry reports rejected with 403 (error quota exceeded)", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ error: "quota exceeded" }), {
      status: 403,
    });

    dispatcher.enqueue(createReport("boom"));
    await dispatcher.flush();
    expectRequestCount(1);

    await dispatcher.flush();
    expectRequestCount(1);
  });

  it.each([[400], [401]])(
    "should not retry reports that failed with %i",
    async (status) => {
      fetchMock.mockResponseOnce("{}", { status });

      dispatcher.enqueue(createReport("boom"));
      await dispatcher.flush();
      expectRequestCount(1);

      await dispatcher.flush();
      expectRequestCount(1);
    }
  );

  it("should drop new reports when the queue is full", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    try {
      // enqueued synchronously, so the queue fills up before any flush runs
      for (let i = 0; i < 30; i++) {
        dispatcher.enqueue(createReport(`boom${i}`));
      }
      await dispatcher.flush();

      expectRequestCount(25);
      expect(warn).toHaveBeenCalledTimes(5);

      await dispatcher.flush();
      expectRequestCount(25);
    } finally {
      warn.mockRestore();
    }
  });
});

describe("WebErrorDispatcher", () => {
  let dispatcher: WebErrorDispatcher;

  beforeEach(() => {
    dispatcher = new WebErrorDispatcher(
      "A-DEV-000",
      "https://localhost:3000",
      env
    );
    fetchMock.resetMocks();
  });

  it("should send report immediately with correct headers", async () => {
    dispatcher.enqueue(createReport("boom"));

    expectRequestCount(1);
    const request = fetchMock.requests().at(0);
    expect(request?.url).toEqual("https://localhost:3000/api/v0/error");
    expect(request?.headers.get("Content-Type")).toEqual("application/json");
    expect(request?.headers.get("App-Key")).toEqual("A-DEV-000");
    expect(request?.headers.get("User-Agent")).toBeNull();

    const body = await request?.json();
    expect(body.errorMessage).toEqual("boom");
  });

  it("should not retry failed reports", async () => {
    fetchMock.mockResponseOnce("{}", { status: 500 });

    dispatcher.enqueue(createReport("boom"));
    expectRequestCount(1);

    await dispatcher.flush();
    expectRequestCount(1);
  });
});
