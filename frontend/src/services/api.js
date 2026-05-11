// ApiService — singleton wrapper around fetch. All API calls go through here.
// Token lives in localStorage under `ld_token`. On 401, we clear the token
// and redirect to /login.

const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'ld_token';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  async request(path, { method = 'GET', body, headers = {}, signal } = {}) {
    const token = this.getToken();
    const finalHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    let payload = null;
    const text = await res.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
    }

    if (!res.ok) {
      const err = new Error(payload?.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.details = payload?.details;
      throw err;
    }

    return payload?.data ?? payload;
  }

  // --- Auth ---
  signup(payload)   { return this.request('/auth/signup', { method: 'POST', body: payload }); }
  login(payload)    { return this.request('/auth/login',  { method: 'POST', body: payload }); }
  me()              { return this.request('/auth/me'); }
  logout()          { return this.request('/auth/logout', { method: 'POST' }); }

  // --- Cars ---
  getCars(params)   {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/cars${qs}`);
  }
  getCar(id)        { return this.request(`/cars/${id}`); }

  // --- Tickets ---
  purchaseTickets(payload) { return this.request('/tickets/purchase', { method: 'POST', body: payload }); }
  myTickets()              { return this.request('/tickets/me'); }

  // --- Draws ---
  getDraws()               { return this.request('/draws'); }
  getDrawTokens(id)        { return this.request(`/draws/${id}/tokens`); }

  // --- Admin ---
  adminOverview()          { return this.request('/admin/overview'); }
  adminCars(params)        {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/cars${qs}`);
  }
  adminCreateCar(payload)  { return this.request('/admin/cars', { method: 'POST', body: payload }); }
  adminUpdateCar(id, p)    { return this.request(`/admin/cars/${id}`, { method: 'PUT', body: p }); }
  adminDeleteCar(id)       { return this.request(`/admin/cars/${id}`, { method: 'DELETE' }); }
  adminUpdateDraw(id, p)   { return this.request(`/admin/draws/${id}`, { method: 'PUT', body: p }); }
  adminDeleteDraw(id)      { return this.request(`/admin/draws/${id}`, { method: 'DELETE' }); }
}

const api = new ApiService();
export default api;
