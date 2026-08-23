/**
 * The only place that talks to the Attio API. Bearer auth, a 5-second
 * timeout per call (KTD5), and a discriminated result that never throws -
 * callers (U5, U6) decide whether and how to retry (KTD4).
 */

export interface AttioSuccess<T = unknown> {
  ok: true;
  data: T;
}

export interface AttioFailure {
  ok: false;
  status: number;
  code?: string;
  message?: string;
}

export type AttioResult<T = unknown> = AttioSuccess<T> | AttioFailure;

const DEFAULT_BASE_URL = "https://api.attio.com";
const TIMEOUT_MS = 5_000;
const MAX_ERROR_LENGTH = 200;

export interface AttioClientConfig {
  apiKey: string;
  /** Injected for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
  /** Injected for tests; defaults to the real Attio API. */
  baseUrl?: string;
}

export interface AttioClient {
  get<T = unknown>(path: string): Promise<AttioResult<T>>;
  post<T = unknown>(path: string, body?: unknown): Promise<AttioResult<T>>;
  put<T = unknown>(path: string, body?: unknown): Promise<AttioResult<T>>;
  patch<T = unknown>(path: string, body?: unknown): Promise<AttioResult<T>>;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function describeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** A human-readable message for a failed AttioResult, for a Slack notice or log line. */
export function describeFailure(result: AttioFailure): string {
  return result.message ?? `Attio request failed with status ${result.status}`;
}

/** KTD4: reads may retry once on failure; writes never do (never wrap a write call in this). */
export async function retryOnce<T>(attempt: () => Promise<AttioResult<T>>): Promise<AttioResult<T>> {
  const first = await attempt();
  if (first.ok) return first;
  return attempt();
}

export function createAttioClient(config: AttioClientConfig): AttioClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;

  async function request<T>(method: string, path: string, body?: unknown): Promise<AttioResult<T>> {
    let res: Response;
    try {
      res = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      // Network failure, DNS failure, or the AbortSignal.timeout firing -
      // all of these throw from fetch itself, before there is a response.
      return { ok: false, status: 0, message: truncate(describeError(err), MAX_ERROR_LENGTH) };
    }

    let parsed: unknown = null;
    try {
      const text = await res.text();
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }

    if (res.ok) {
      const envelope = parsed as { data?: T } | null;
      const data = (envelope && typeof envelope === "object" && "data" in envelope ? envelope.data : parsed) as T;
      return { ok: true, data };
    }

    const errorBody = parsed as { code?: string; message?: string } | null;
    return {
      ok: false,
      status: res.status,
      code: errorBody?.code,
      message: errorBody?.message ? truncate(errorBody.message, MAX_ERROR_LENGTH) : undefined,
    };
  }

  return {
    get: <T = unknown>(path: string) => request<T>("GET", path),
    post: <T = unknown>(path: string, body?: unknown) => request<T>("POST", path, body),
    put: <T = unknown>(path: string, body?: unknown) => request<T>("PUT", path, body),
    patch: <T = unknown>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  };
}
