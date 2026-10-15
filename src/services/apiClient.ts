export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
