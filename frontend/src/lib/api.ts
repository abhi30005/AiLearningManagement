const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const AUTH_CHANGED_EVENT = 'auth:changed';
const DEFAULT_GET_CACHE_TTL_MS = 1500;

type ApiFetchOptions = RequestInit & {
  cacheTtlMs?: number;
  skipCache?: boolean;
  dedupe?: boolean;
}

const inFlightGetRequests = new Map<string, Promise<unknown>>();
const getResponseCache = new Map<string, { data: unknown; expiresAt: number }>();

function createRequestKey(endpoint: string, method: string, headers: Headers) {
  const headerEntries = Array.from(headers.entries()).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify({ endpoint, method, headers: headerEntries });
}

export function clearApiCache() {
  getResponseCache.clear();
  inFlightGetRequests.clear();
}

async function readResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    cacheTtlMs = DEFAULT_GET_CACHE_TTL_MS,
    dedupe = true,
    skipCache = false,
    ...fetchOptions
  } = options;

  const method = (fetchOptions.method || 'GET').toUpperCase();
  const headers = new Headers(fetchOptions.headers);
  
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const shouldCache = method === 'GET' && !skipCache;
  const requestKey = createRequestKey(endpoint, method, headers);

  if (shouldCache) {
    const cached = getResponseCache.get(requestKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    if (dedupe) {
      const inFlight = inFlightGetRequests.get(requestKey);
      if (inFlight) {
        return inFlight as Promise<T>;
      }
    }
  }

  const request = (async () => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      method,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorData = await readResponseBody<{ detail?: string }>(response);
        if (errorData.detail) {
          errorMsg = errorData.detail;
        }
      } catch (e) {
        // Not JSON
      }

      if (response.status === 401) {
        localStorage.removeItem('token');
        clearApiCache();
        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
        errorMsg = errorMsg || 'Session expired. Please sign in again.';
      }

      throw new Error(errorMsg);
    }

    const data = await readResponseBody<T>(response);

    if (method === 'GET' && !skipCache && cacheTtlMs > 0) {
      getResponseCache.set(requestKey, {
        data,
        expiresAt: Date.now() + cacheTtlMs,
      });
    } else if (method !== 'GET') {
      getResponseCache.clear();
    }

    return data;
  })();

  if (shouldCache && dedupe) {
    inFlightGetRequests.set(requestKey, request);
    request.then(
      () => inFlightGetRequests.delete(requestKey),
      () => inFlightGetRequests.delete(requestKey)
    );
  }

  return request;
}
