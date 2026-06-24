// Cliente para hablar con nuestra propia API (antes usábamos Supabase directamente)
const API_URL = (import.meta as any).env.VITE_API_URL as string;

if (!API_URL) {
  console.warn("⚠️ Atención: VITE_API_URL no está configurada.");
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error en la solicitud.');
  }
  return data;
}

export const api = {
  login: (correo: string, password: string, area: string) =>
    request('/api/login', { method: 'POST', body: JSON.stringify({ correo, password, area }) }),

  changePassword: (correo: string, oldPassword: string, newPassword: string) =>
    request('/api/change-password', {
      method: 'POST',
      body: JSON.stringify({ correo, oldPassword, newPassword }),
    }),

  updatePassword: (correo: string, newPassword: string) =>
    request('/api/update-password', {
      method: 'POST',
      body: JSON.stringify({ correo, newPassword }),
    }),

  listPerfiles: () => request('/api/perfiles'),

  createPerfil: (correo: string, password: string, area: string) =>
    request('/api/perfiles', { method: 'POST', body: JSON.stringify({ correo, password, area }) }),

  updatePerfil: (id: string, payload: { correo?: string; password?: string; area?: string }) =>
    request(`/api/perfiles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deletePerfil: (id: string) => request(`/api/perfiles/${id}`, { method: 'DELETE' }),
};
