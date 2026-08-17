import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { registerCrashReporting } from "./crash-reporting";
import type { AptabaseClient } from "./client";

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;

const createClient = () => ({
  trackErrorInternal: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined),
});

describe("registerCrashReporting", () => {
  let previousHandler: Mock<GlobalErrorHandler>;
  let currentHandler: GlobalErrorHandler;
  let client: ReturnType<typeof createClient>;

  beforeEach(() => {
    previousHandler = vi.fn<GlobalErrorHandler>();
    currentHandler = previousHandler;
    client = createClient();

    // stateful stub mirroring react-native's global ErrorUtils
    vi.stubGlobal("ErrorUtils", {
      getGlobalHandler: () => currentHandler,
      setGlobalHandler: (handler: GlobalErrorHandler) => {
        currentHandler = handler;
      },
    });
  });

  afterEach(() => {
    vi.stubGlobal("ErrorUtils", undefined);
    vi.stubGlobal("__DEV__", true);
    vi.useRealTimers();
  });

  const register = () =>
    registerCrashReporting(client as unknown as AptabaseClient);

  it("should report fatal errors as crashes and chain to the previous handler", () => {
    register();

    const error = new Error("boom");
    currentHandler(error, true);

    expect(client.trackErrorInternal).toHaveBeenCalledWith(
      error,
      "fatal",
      "crash"
    );
    expect(previousHandler).toHaveBeenCalledWith(error, true);
  });

  it("should report non-fatal errors as unhandled", () => {
    register();

    const error = new Error("boom");
    currentHandler(error, false);

    expect(client.trackErrorInternal).toHaveBeenCalledWith(
      error,
      "error",
      "unhandled"
    );
    expect(previousHandler).toHaveBeenCalledWith(error, false);
  });

  it("should restore the previous handler on unregister", () => {
    const unregister = register();

    expect(currentHandler).not.toBe(previousHandler);
    unregister();
    expect(currentHandler).toBe(previousHandler);
  });

  it("should not restore the previous handler if a third party registered on top", () => {
    const unregister = register();

    const thirdParty = vi.fn();
    currentHandler = thirdParty;

    unregister();
    expect(currentHandler).toBe(thirdParty);
  });

  it("should stop reporting from a stale handler after unregister", () => {
    const unregister = register();
    const staleHandler = currentHandler;

    const thirdParty = vi.fn();
    currentHandler = thirdParty;
    unregister();

    const error = new Error("boom");
    staleHandler(error, false);

    expect(client.trackErrorInternal).not.toHaveBeenCalled();
    expect(previousHandler).toHaveBeenCalledWith(error, false);
  });

  it("should not double-report after a re-register cycle", () => {
    const unregister = register();
    unregister();
    register();

    currentHandler(new Error("boom"), false);

    expect(client.trackErrorInternal).toHaveBeenCalledTimes(1);
    expect(previousHandler).toHaveBeenCalledTimes(1);
  });

  it("should be a no-op when ErrorUtils is not available", () => {
    vi.stubGlobal("ErrorUtils", undefined);

    const unregister = register();

    expect(() => unregister()).not.toThrow();
    expect(currentHandler).toBe(previousHandler);
  });

  describe("in release builds", () => {
    beforeEach(() => {
      vi.stubGlobal("__DEV__", false);
    });

    it("should flush before chaining fatal errors to the previous handler", async () => {
      register();

      const error = new Error("boom");
      currentHandler(error, true);

      expect(client.trackErrorInternal).toHaveBeenCalledWith(
        error,
        "fatal",
        "crash"
      );
      expect(client.flush).toHaveBeenCalled();
      // the previous handler terminates the process, so it must only be
      // called after the flush settled
      expect(previousHandler).not.toHaveBeenCalled();

      await vi.waitFor(() => {
        expect(previousHandler).toHaveBeenCalledWith(error, true);
      });
    });

    it("should chain fatal errors after the timeout when the flush hangs", async () => {
      vi.useFakeTimers();
      client.flush.mockReturnValue(new Promise(() => undefined));

      register();

      const error = new Error("boom");
      currentHandler(error, true);
      expect(previousHandler).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(2000);
      expect(previousHandler).toHaveBeenCalledWith(error, true);
    });

    it("should chain non-fatal errors synchronously", () => {
      register();

      const error = new Error("boom");
      currentHandler(error, false);

      expect(previousHandler).toHaveBeenCalledWith(error, false);
      expect(client.flush).not.toHaveBeenCalled();
    });
  });
});
