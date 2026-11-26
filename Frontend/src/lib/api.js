const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const KEY = 'laycafe_session';
export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  }
  catch {
    return null;
  }
};
export const saveSession = (session) => localStorage.setItem(KEY, JSON.stringify(session));
export const clearSession = () => localStorage.removeItem(KEY);
export async function api(path, options = {}) {
  const token = getSession()?.token;
  let response;
  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers: {
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers
        }
      }
    );
  }
  catch {
    throw new Error('Cannot connect to the LayCafe server. Start Backend first and check the connection.');
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !path.includes('/auth/login'))
      window.dispatchEvent(new Event('laycafe-logout'));
    throw new Error(data?.message || `Server returned ${response.status}.`);
  }
  return data;
}
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) });
export const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) });
export const remove = path => api(path, { method: 'DELETE' });
