// Thin wrapper around fetch: adds the base URL, JSON headers and the auth token,
// and turns error responses into ApiError with the server's message.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const TOKEN_KEY = 'retain_token';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

// AuthContext registers this so an expired token signs the user out.
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  let res: Response;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    const message =
      data && typeof data === 'object' && 'message' in data ? String(data.message) : 'Request failed';
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong';
