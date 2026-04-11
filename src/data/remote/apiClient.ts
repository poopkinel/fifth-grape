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

type RequestOptions = {
  method: "GET" | "POST";
  body?: unknown;
};

async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!API_BASE_URL) {
    throw new ApiError(0, "API base URL is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method,
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined && {
          "Content-Type": "application/json",
        }),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
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

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body });
}
