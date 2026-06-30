import { env } from '@/lib/env';
import { getAccessToken } from '@/lib/auth/token';
import type { ApiError } from '@writer-mentor-ai/shared/common';

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: ApiError['errors'],
    public data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function normalizeApiMessage(body: Record<string, unknown>, statusText: string): string {
  const message = body.message;
  if (Array.isArray(message)) {
    return message.map(String).join('; ');
  }
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  if (message && typeof message === 'object') {
    return JSON.stringify(message);
  }
  if (typeof body.error === 'string' && body.error.trim()) {
    return body.error;
  }
  return statusText || 'Request failed';
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_URL}/api${path}`;
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiError & Record<string, unknown>;
    throw new ApiClientError(
      res.status,
      normalizeApiMessage(body, res.statusText),
      body.errors,
      body,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
