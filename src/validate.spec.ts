import { describe, expect, it } from "vitest";
import { validate } from "./validate";

describe("Validate", () => {
  [
    {
      platform: "ios" as const,
      appKey: "A-DEV-000",
      options: undefined,
      expected: [true, ""],
    },
    {
      platform: "ios" as const,
      appKey: "A-SH-1234",
      options: {
        host: "https://aptabase.mycompany.com",
      },
      expected: [true, ""],
    },
    {
      platform: "web" as const,
      appKey: "A-DEV-000",
      options: undefined,
      expected: [false, "This SDK is only supported on Android and iOS."],
    },
    {
      platform: "ios" as const,
      appKey: "A-WTF-000",
      options: undefined,
      expected: [false, 'App Key "A-WTF-000" is invalid'],
    },
    {
      platform: "ios" as const,
      appKey: "A-SH-1234",
      options: undefined,
      expected: [
        false,
        "Host parameter must be defined when using Self-Hosted App Key.",
      ],
    },
  ].forEach(({ platform, appKey, options, expected }) => {
    it(`should validate ${platform} ${appKey} ${options}`, async () => {
      const result = validate(platform, appKey, options);
      expect(result).toEqual(expected);
    });
  });
});
