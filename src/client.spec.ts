import "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AptabaseClient } from "./client";
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

describe("AptabaseClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow override of appVersion", async () => {
    const client = new AptabaseClient("A-DEV-000", env, {
      appVersion: "2.0.0",
    });

    client.trackEvent("Hello");
    await client.flush();

    const body = await fetchMock.requests().at(0)?.json();
    expect(body[0].eventName).toEqual("Hello");
    expect(body[0].systemProps).toEqual({ ...env, appVersion: "2.0.0" });
  });

  it("should send event with correct props", async () => {
    const client = new AptabaseClient("A-DEV-000", env);

    client.trackEvent("test", { count: 1, foo: "bar" });
    await client.flush();

    const body = await fetchMock.requests().at(0)?.json();
    expect(body[0].eventName).toEqual("test");
    expect(body[0].props).toEqual({ count: 1, foo: "bar" });
    expect(body[0].systemProps).toEqual(env);
  });

  it("should flush events every 500ms", async () => {
    const client = new AptabaseClient("A-DEV-000", env);
    client.startPolling(500);

    client.trackEvent("Hello1");
    vi.advanceTimersByTime(510);

    expect(fetchMock.requests().length).toEqual(1);
    const request1 = await fetchMock.requests().at(0)?.json();
    expect(request1[0].eventName).toEqual("Hello1");

    // after another tick, nothing should be sent
    vi.advanceTimersByTime(510);
    expect(fetchMock.requests().length).toEqual(1);

    // after a trackEvent and another tick, the event should be sent
    client.trackEvent("Hello2");
    vi.advanceTimersByTime(510);
    expect(fetchMock.requests().length).toEqual(2);
    const request2 = await fetchMock.requests().at(1)?.json();
    expect(request2[0].eventName).toEqual("Hello2");
  });

  it("should stop flush if polling stopped", async () => {
    const client = new AptabaseClient("A-DEV-000", env);
    client.startPolling(500);

    client.trackEvent("Hello1");
    vi.advanceTimersByTime(510);

    expect(fetchMock.requests().length).toEqual(1);

    // if polling stopped, no more events should be sent
    client.stopPolling();
    client.trackEvent("Hello2");
    vi.advanceTimersByTime(5000);
    expect(fetchMock.requests().length).toEqual(1);
  });

  it("should generate new session after long period of inactivity", async () => {
    const client = new AptabaseClient("A-DEV-000", env);

    client.trackEvent("Hello1");
    await client.flush();

    const request1 = await fetchMock.requests().at(0)?.json();
    const sessionId1 = request1[0].sessionId;
    expect(sessionId1).toBeDefined();

    // after 10 minutes, the same session should be used
    vi.advanceTimersByTime(10 * 60 * 1000);

    client.trackEvent("Hello2");
    await client.flush();

    const request2 = await fetchMock.requests().at(1)?.json();
    const sessionId2 = request2[0].sessionId;
    expect(sessionId2).toBeDefined();
    expect(sessionId2).toBe(sessionId1);

    // after 2 hours, the same session should be used
    vi.advanceTimersByTime(2 * 60 * 60 * 1000);

    client.trackEvent("Hello3");
    await client.flush();

    const request3 = await fetchMock.requests().at(2)?.json();
    const sessionId3 = request3[0].sessionId;
    expect(sessionId3).toBeDefined();
    expect(sessionId3).not.toBe(sessionId1);
  });
});
