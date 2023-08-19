import { describe, expect, it } from "vitest";
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
  it("should create a client", async () => {
    const client = new AptabaseClient("A-DEV-000", env);
    expect(client).toBeDefined();
  });
});
