import { DayaProError } from "./error";
import type { DayaApiErrorBody, DayaApiResponse, DayaProConfig } from "./types";

interface RequestOptions extends Omit<RequestInit, "body"> {
  authenticated?: boolean;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

function toHeaderRecord(input?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!input) return headers;

  if (Array.isArray(input)) {
    for (const [key, value] of input) headers[key] = value;
  } else if (typeof (input as Headers).forEach === "function") {
    (input as Headers).forEach((value, key) => {
      headers[key] = value;
    });
  } else {
    Object.assign(headers, input);
  }

  return headers;
}

export class HttpClient {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(config: DayaProConfig & { baseUrl: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.fetcher = config.fetch ?? globalThis.fetch;

    if (!this.fetcher) {
      throw new Error("Daya Pro requires Node.js 18+ or a custom fetch implementation.");
    }
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { authenticated = true, body, query, ...init } = options;

    if (authenticated && !this.apiKey) {
      throw new Error("An apiKey is required for this Daya Pro endpoint.");
    }

    const url = new URL(`${this.baseUrl}/${path.replace(/^\//, "")}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const headers = toHeaderRecord(init.headers);
    headers.Accept = "application/json";
    if (authenticated && this.apiKey) headers["X-Api-Key"] = this.apiKey;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const response = await this.fetcher(url, {
      ...init,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });

    const text = await response.text();
    const payload = text ? (JSON.parse(text) as DayaApiResponse<T> | DayaApiErrorBody) : undefined;

    if (!response.ok || payload?.success === false) {
      const errorBody = payload as DayaApiErrorBody | undefined;
      throw new DayaProError(
        errorBody?.error?.message ?? errorBody?.message ?? `Daya Pro request failed with status ${response.status}`,
        response.status,
        errorBody
      );
    }

    return (payload as DayaApiResponse<T>).data;
  }
}
