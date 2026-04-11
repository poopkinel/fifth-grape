import { apiGet, ApiError } from "../apiClient";

const MOCK_BASE_URL = "https://api.test.com";

beforeEach(() => {
  process.env.EXPO_PUBLIC_API_BASE_URL = MOCK_BASE_URL;
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.EXPO_PUBLIC_API_BASE_URL;
});

function mockFetchResponse(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("apiGet", () => {
  it("throws ApiError when API_BASE_URL is not set", async () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    await expect(apiGet("/test")).rejects.toThrow(
      expect.objectContaining({
        name: "ApiError",
        status: 0,
        message: "API base URL is not configured",
      }),
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches JSON from the correct URL", async () => {
    const data = { stores: [] };
    mockFetchResponse(data);

    const result = await apiGet("/v1/market/snapshot");

    expect(global.fetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/v1/market/snapshot`,
      expect.objectContaining({
        method: "GET",
        headers: { Accept: "application/json" },
      }),
    );
    expect(result).toEqual(data);
  });

  it("throws ApiError with status on non-2xx response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    await expect(apiGet("/test")).rejects.toThrow(
      expect.objectContaining({
        name: "ApiError",
        status: 500,
        message: "API request failed: 500",
      }),
    );
  });

  it("throws ApiError on network failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new TypeError("Network error"),
    );

    await expect(apiGet("/test")).rejects.toThrow(
      expect.objectContaining({
        name: "ApiError",
        status: 0,
        message: "Network error",
      }),
    );
  });

  it("throws ApiError on abort/timeout", async () => {
    const abortError = new DOMException(
      "The operation was aborted",
      "AbortError",
    );
    (global.fetch as jest.Mock).mockRejectedValue(abortError);

    await expect(apiGet("/test")).rejects.toThrow(
      expect.objectContaining({
        name: "ApiError",
        status: 0,
        message: "Request timed out",
      }),
    );
  });
});
