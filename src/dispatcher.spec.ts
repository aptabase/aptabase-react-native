import "vitest-fetch-mock";
import { NativeEventDispatcher, WebEventDispatcher } from "./dispatcher";
import { beforeEach, describe, expect, it } from "vitest";
import type { EnvironmentInfo } from "./env";

const env: EnvironmentInfo = {
  isDebug: false,
  locale: "en-US",
  osName: "iOS",
  osVersion: "14.3",
  appVersion: "1.0.0",
  appBuildNumber: "1",
  sdkVersion: "aptabase-reactnative@1.0.0",
};

const createEvent = (eventName: string) => ({
  timestamp: new Date().toISOString(),
  sessionId: "123",
  eventName,
  systemProps: { ...env },
});

const expectRequestCount = (count: number) => {
  expect(fetchMock.requests().length).toEqual(count);
};

const expectEventsCount = async (
  requestIndex: number,
  expectedNumOfEvents: number
) => {
  const body = await fetchMock.requests().at(requestIndex)?.json();
  expect(body.length).toEqual(expectedNumOfEvents);
};

describe("NativeEventDispatcher", () => {
  let dispatcher: NativeEventDispatcher;

  beforeEach(() => {
    dispatcher = new NativeEventDispatcher(
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

  it("should send even with correct headers", async () => {
    dispatcher.enqueue(createEvent("app_started"));
    await dispatcher.flush();

    const request = await fetchMock.requests().at(0);
    expect(request).not.toBeUndefined();
    expect(request?.url).toEqual("https://localhost:3000/api/v0/events");
    expect(request?.headers.get("Content-Type")).toEqual("application/json");
    expect(request?.headers.get("App-Key")).toEqual("A-DEV-000");
    expect(request?.headers.get("User-Agent")).toEqual("iOS/14.3 en-US");
  });

  it("should dispatch single event", async () => {
    fetchMock.mockResponseOnce("{}");

    dispatcher.enqueue(createEvent("app_started"));
    await dispatcher.flush();

    expectRequestCount(1);
    await expectEventsCount(0, 1);
  });

  it("should not dispatch event if it's already been sent", async () => {
    fetchMock.mockResponseOnce("{}");

    dispatcher.enqueue(createEvent("app_started"));
    await dispatcher.flush();
    expectRequestCount(1);

    await dispatcher.flush();
    expectRequestCount(1);
  });

  it("should dispatch multiple events", async () => {
    fetchMock.mockResponseOnce("{}");

    dispatcher.enqueue(createEvent("app_started"));
    dispatcher.enqueue(createEvent("app_exited"));
    await dispatcher.flush();

    expectRequestCount(1);
    await expectEventsCount(0, 2);
  });

  it("should send many events in chunks of 25 items", async () => {
    fetchMock.mockResponseOnce("{}");

    for (let i = 0; i < 60; i++) {
      dispatcher.enqueue(createEvent("hello_world"));
    }
    await dispatcher.flush();

    expectRequestCount(3);
    await expectEventsCount(0, 25);
    await expectEventsCount(1, 25);
    await expectEventsCount(2, 10);
  });

  it("should retry failed requests in a subsequent flush", async () => {
    fetchMock.mockResponseOnce("{}", { status: 500 });

    dispatcher.enqueue(createEvent("hello_world"));
    await dispatcher.flush();

    expectRequestCount(1);
    await expectEventsCount(0, 1);

    fetchMock.mockResponseOnce("{}", { status: 200 });
    await dispatcher.flush();

    expectRequestCount(2);
    await expectEventsCount(1, 1);
  });

  it("should not retry requests that failed with 4xx", async () => {
    fetchMock.mockResponseOnce("{}", { status: 400 });

    dispatcher.enqueue(createEvent("hello_world"));
    await dispatcher.flush();

    expectRequestCount(1);
    await expectEventsCount(0, 1);

    await dispatcher.flush();

    expectRequestCount(1);
  });
});

describe("WebEventDispatcher", () => {
  let dispatcher: WebEventDispatcher;

  beforeEach(() => {
    dispatcher = new WebEventDispatcher(
      "A-DEV-000",
      "https://localhost:3000",
      env
    );
    fetchMock.resetMocks();
  });

  it("should send event with correct headers", async () => {
    dispatcher.enqueue(createEvent("app_started"));

    const request = await fetchMock.requests().at(0);
    expect(request).not.toBeUndefined();
    expect(request?.url).toEqual("https://localhost:3000/api/v0/event");
    expect(request?.headers.get("Content-Type")).toEqual("application/json");
    expect(request?.headers.get("App-Key")).toEqual("A-DEV-000");
  });

  it("should dispatch single event", async () => {
    fetchMock.mockResponseOnce("{}");

    dispatcher.enqueue(createEvent("app_started"));

    expectRequestCount(1);
    const body = await fetchMock.requests().at(0)?.json();
    expect(body.eventName).toEqual("app_started");
  });

  it("should dispatch multiple events individually", async () => {
    fetchMock.mockResponseOnce("{}");
    fetchMock.mockResponseOnce("{}");

    dispatcher.enqueue([createEvent("app_started"), createEvent("app_exited")]);

    expectRequestCount(2);
    const body1 = await fetchMock.requests().at(0)?.json();
    const body2 = await fetchMock.requests().at(1)?.json();
    expect(body1.eventName).toEqual("app_started");
    expect(body2.eventName).toEqual("app_exited");
  });

  it("should not retry requests that failed with 4xx", async () => {
    fetchMock.mockResponseOnce("{}", { status: 400 });

    dispatcher.enqueue(createEvent("hello_world"));

    expectRequestCount(1);
    const body = await fetchMock.requests().at(0)?.json();
    expect(body.eventName).toEqual("hello_world");

    dispatcher.enqueue(createEvent("hello_world"));

    expectRequestCount(2);
  });
});
