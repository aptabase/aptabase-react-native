import "vitest-fetch-mock";
import { EventDispatcher } from "./dispatcher";
import { beforeEach, describe, expect, it } from "vitest";

const createEvent = (eventName: string) => ({
  timestamp: new Date().toISOString(),
  sessionId: "123",
  eventName,
  systemProps: {
    isDebug: false,
    locale: "en-US",
    osName: "iOS",
    osVersion: "14.3",
    appVersion: "1.0.0",
    sdkVersion: "1.0.0",
  },
});

const expectRequestCount = (count: number) => {
  expect(fetchMock.requests().length).toEqual(count);
};

const expectEventsCount = async (
  requestIndex: number,
  expectedNumOfEvents: number
) => {
  const body = await fetchMock.requests()[requestIndex].json();
  expect(body.length).toEqual(expectedNumOfEvents);
};

describe("EventDispatcher", () => {
  let dispatcher: EventDispatcher;

  beforeEach(() => {
    dispatcher = new EventDispatcher("https://localhost:3000", "A-DEV-000");
    fetchMock.resetMocks();
  });

  it("should not send a request if queue is empty", async () => {
    await dispatcher.flush();

    expectRequestCount(0);
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
});
