import { describe, expect, it } from "vitest";
import { newSessionId } from "./session";

describe("Session", () => {
  it("should generate session ids", async () => {
    const id = newSessionId();

    expect(id).toHaveLength(18);
    expect(id).toMatch(/^[0-9]*$/);
  });
});
