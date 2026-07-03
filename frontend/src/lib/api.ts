const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const AUTH_CHANGED_EVENT = 'auth:changed';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMsg = errorData.detail;
      }
    } catch (e) {
      // Not JSON
    }

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      errorMsg = errorMsg || 'Session expired. Please sign in again.';
    }

    throw new Error(errorMsg);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
