import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";

vi.stubGlobal("__DEV__", true);

const fetchMocker = createFetchMock(vi);

fetchMocker.enableMocks();
