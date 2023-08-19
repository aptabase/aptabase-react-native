import { describe, expect, it } from "vitest";
import { newSessionId } from "./session";

describe("Session", () => {
  it("should generate session ids", async () => {
    const id = newSessionId();

    expect(id).toHaveLength(36);
    const uuidRegex =
      /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/;
    expect(id).toMatch(uuidRegex);
  });
});
