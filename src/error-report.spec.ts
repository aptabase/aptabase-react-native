import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildErrorReport, normalizeError } from "./error-report";
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

describe("normalizeError", () => {
  it("should extract name, message and stack from an Error", () => {
    const error = new TypeError("boom");
    const result = normalizeError(error);

    expect(result.name).toEqual("TypeError");
    expect(result.message).toEqual("boom");
    expect(result.stack).toEqual(error.stack);
  });

  it("should fall back to 'Error' when the name is empty", () => {
    const error = new Error("boom");
    error.name = "";

    expect(normalizeError(error).name).toEqual("Error");
  });

  it.each([
    ["a string", "a thrown string", "a thrown string"],
    ["a number", 42, "42"],
    ["null", null, "null"],
    ["undefined", undefined, "undefined"],
    ["an object", { code: 1 }, "[object Object]"],
  ])("should stringify %s", (_, value, expected) => {
    const result = normalizeError(value);

    expect(result.name).toEqual("Error");
    expect(result.message).toEqual(expected);
    expect(result.stack).toBeUndefined();
  });

  it("should handle values that cannot be stringified", () => {
    const result = normalizeError(Object.create(null));

    expect(result.name).toEqual("Error");
    expect(result.message).toEqual("[unserializable error]");
  });
});

describe("buildErrorReport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should build a report with all fields", () => {
    const report = buildErrorReport(
      new TypeError("boom"),
      "error",
      "handled",
      "123",
      env
    );

    expect(report.errorMessage).toEqual("TypeError: boom");
    expect(report.errorType).toEqual("TypeError");
    expect(report.stackTrace).toBeDefined();
    expect(report.timestamp).toEqual(new Date().toISOString());
    expect(report.sessionId).toEqual("123");
    expect(report.platform).toEqual("React Native");
    expect(report.osName).toEqual("iOS");
    expect(report.osVersion).toEqual("14.3");
    expect(report.appVersion).toEqual("1.0.0");
    expect(report.sdkVersion).toEqual("aptabase-reactnative@1.0.0");
    expect(report.severity).toEqual("error");
    expect(report.kind).toEqual("handled");
    expect(report.isDebug).toEqual(false);
  });

  it("should not include event-only fields", () => {
    const report = buildErrorReport(
      new Error("boom"),
      "error",
      "handled",
      "123",
      env
    );

    expect(report).not.toHaveProperty("locale");
    expect(report).not.toHaveProperty("appBuildNumber");
    expect(report).not.toHaveProperty("eventName");
  });

  it("should prefix the message with 'Fatal' for fatal errors, but not the type", () => {
    const report = buildErrorReport(
      new TypeError("boom"),
      "fatal",
      "crash",
      "123",
      env
    );

    expect(report.errorMessage).toEqual("Fatal TypeError: boom");
    expect(report.errorType).toEqual("TypeError");
  });

  it("should send osName even on web", () => {
    const webEnv = { ...env, osName: "web", osVersion: "" };
    const report = buildErrorReport(
      new Error("boom"),
      "error",
      "handled",
      "123",
      webEnv
    );

    expect(report.osName).toEqual("web");
    expect(report.osVersion).toBeUndefined();
  });

  it("should truncate fields to the server limits", () => {
    const error = new Error("m".repeat(6000));
    error.name = "N".repeat(200);
    error.stack = "s".repeat(20000);

    const report = buildErrorReport(error, "error", "handled", "123", {
      ...env,
      appVersion: "v".repeat(60),
    });

    expect(report.errorMessage.length).toEqual(5000);
    expect(report.errorType).toEqual("N".repeat(100));
    expect(report.stackTrace?.length).toEqual(10000);
    expect(report.appVersion?.length).toEqual(50);
  });
});
