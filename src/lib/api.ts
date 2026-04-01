const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
const REQUEST_TIMEOUT_MS = 15000;

function isLoopbackHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function normalizeLoopbackApiBaseUrl(baseUrl: string) {
  if (!baseUrl || typeof window === "undefined") {
    return baseUrl;
  }

  try {
    const parsed = new URL(baseUrl);
    const currentHostname = window.location.hostname;

    if (isLoopbackHost(parsed.hostname) && isLoopbackHost(currentHostname) && parsed.hostname !== currentHostname) {
      parsed.hostname = currentHostname;
      if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        parsed.protocol = window.location.protocol;
      }
      return parsed.toString().replace(/\/$/, "");
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return baseUrl;
  }
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  rawText?: string;

  constructor(message: string, options?: { status?: number; code?: string; details?: unknown; rawText?: string }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status ?? 0;
    this.code = options?.code ?? "api_error";
    this.details = options?.details;
    this.rawText = options?.rawText;
  }
}

function deriveSameOriginApiBaseUrl() {
  if (typeof window === "undefined" || !window.location.origin) {
    return "";
  }

  return `${window.location.origin}/ghanaian-dream-travel-main/api`;
}

export const API_BASE_URL = normalizeLoopbackApiBaseUrl(RAW_API_BASE_URL || deriveSameOriginApiBaseUrl());
export const isApiConfigured = Boolean(API_BASE_URL);

export function getApiUrl(action: string) {
  if (!API_BASE_URL) {
    return "";
  }

  return `${API_BASE_URL}/index.php?action=${action}`;
}

export function shouldFallbackToLocalApi(error: unknown) {
  if (!(error instanceof ApiError)) {
    return (
      error instanceof TypeError ||
      error instanceof SyntaxError ||
      (error instanceof Error &&
        ["Failed to fetch", "Load failed", "NetworkError", "Network request failed", "Unexpected token", "JSON", "timeout"].some((text) =>
          error.message.includes(text),
        ))
    );
  }

  return error.status === 0 || error.code === "network_error" || error.code === "invalid_json" || error.code === "timeout";
}

function normalizeApiError(response: Response, payload: Record<string, unknown> | null, rawText: string) {
  const status = response.status;
  const serverMessage = typeof payload?.error === "string"
    ? payload.error
    : typeof payload?.message === "string"
      ? payload.message
      : "";

  const message = serverMessage || (
    status === 401 ? "Session expired. Please log in again."
      : status === 403 ? "You do not have permission for this action."
      : status === 404 ? "The requested API route could not be found."
      : status >= 500 ? "Server error. Please try again shortly."
      : "Request failed."
  );

  return new ApiError(message, {
    status,
    code: typeof payload?.code === "string" ? payload.code : `http_${status}`,
    details: payload ?? undefined,
    rawText,
  });
}

export async function apiRequest<T>(action: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("API base URL is not configured.", { code: "missing_api_base_url" });
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getApiUrl(action), {
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(init?.headers ?? {}),
      },
      ...init,
      signal: init?.signal ?? controller.signal,
    });

    const rawText = await response.text();
    const trimmed = rawText.trim();
    const payload = trimmed ? (() => {
      try {
        return JSON.parse(trimmed) as Record<string, unknown>;
      } catch {
        return null;
      }
    })() : null;

    if (!payload && trimmed) {
      const htmlLike = /^<!doctype html>|^<html/i.test(trimmed);
      throw new ApiError(
        htmlLike ? "The server returned HTML instead of JSON. Check the API URL or PHP output." : "The server returned an invalid JSON response.",
        { status: response.status, code: "invalid_json", rawText },
      );
    }

    if (!response.ok) {
      throw normalizeApiError(response, payload, rawText);
    }

    return (payload ?? {}) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.", { code: "timeout" });
    }

    if (error instanceof Error) {
      throw new ApiError(
        error.message.includes("Failed to fetch")
          ? "Unable to reach the server. Check the API URL, backend status, or network connection."
          : error.message,
        { code: "network_error" },
      );
    }

    throw new ApiError("Unexpected API error.", { code: "unknown_error" });
  } finally {
    window.clearTimeout(timeoutId);
  }
}
