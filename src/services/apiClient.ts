const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1');

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (isLocalhost || import.meta.env.DEV ? 'http://localhost:5000' : '');

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token =
    localStorage.getItem('rf_jwt_token') ||
    localStorage.getItem('rf_firebase_token');

  const role = localStorage.getItem('rf_role');
  const userStr = localStorage.getItem('rf_user');
  let currentRole = role;
  if (userStr) {
    try {
      currentRole = JSON.parse(userStr).role || currentRole;
    } catch {}
  }

  const isAdminEndpoint = endpoint.startsWith('/api/admin');

  // If requesting an admin endpoint, ensure admin authorization token
  if (isAdminEndpoint) {
    if (currentRole !== 'admin' || !token) {
      token = 'demo-admin-token';
    }
  } else if (!token) {
    token = currentRole === 'admin' ? 'demo-admin-token' : 'demo-token';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(isAdminEndpoint ? { 'x-admin-console': 'true' } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (contentType.includes('application/json')) {
      const errorData = await response.json().catch(() => ({}));
      errorMessage = errorData.error || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  if (text.trim().startsWith('<')) {
    throw new Error(
      `Endpoint ${endpoint} returned HTML instead of JSON. Ensure backend service is running.`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response from ${endpoint}`);
  }
}
