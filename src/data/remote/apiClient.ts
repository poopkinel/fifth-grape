const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!API_BASE_URL) {
    throw new ApiError(0, "API base URL is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `API request failed: ${response.status}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(0, "Request timed out");
    }

    throw new ApiError(0, (error as Error).message ?? "Network request failed");
  } finally {
    clearTimeout(timeout);
  }
}
