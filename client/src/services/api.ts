import { BusinessDetails, Invoice } from "../types";

const BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Auth ─────────────────────────────────────────────
export const authApi = {
  signup: (email: string, password: string, businessDetails: Partial<BusinessDetails>) =>
    fetch(`${BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, businessDetails }),
    }).then(handleResponse),

  login: (email: string, password: string) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE}/auth/me`, { headers: authHeaders() }).then(handleResponse),
};

// ── Business ─────────────────────────────────────────
export const businessApi = {
  get: () =>
    fetch(`${BASE}/business`, { headers: authHeaders() }).then(handleResponse),

  update: (data: Partial<BusinessDetails>) =>
    fetch(`${BASE}/business`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
};

// ── Invoices ─────────────────────────────────────────
export const invoiceApi = {
  getAll: () =>
    fetch(`${BASE}/invoices`, { headers: authHeaders() }).then(handleResponse),

  getOne: (id: string) =>
    fetch(`${BASE}/invoices/${id}`, { headers: authHeaders() }).then(handleResponse),

  create: (invoice: Omit<Invoice, "_id">) =>
    fetch(`${BASE}/invoices`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(invoice),
    }).then(handleResponse),

  update: (id: string, invoice: Partial<Invoice>) =>
    fetch(`${BASE}/invoices/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(invoice),
    }).then(handleResponse),

  delete: (id: string) =>
    fetch(`${BASE}/invoices/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  getNextNumber: () =>
    fetch(`${BASE}/invoices/next-number`, { headers: authHeaders() }).then(handleResponse),
};

// ── Master Items ─────────────────────────────────────
export const itemApi = {
  getAll: () =>
    fetch(`${BASE}/items`, { headers: authHeaders() }).then(handleResponse),

  create: (item: { name: string; price: number; description?: string }) =>
    fetch(`${BASE}/items`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(item),
    }).then(handleResponse),

  update: (id: string, item: Partial<{ name: string; price: number; description: string }>) =>
    fetch(`${BASE}/items/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(item),
    }).then(handleResponse),

  delete: (id: string) =>
    fetch(`${BASE}/items/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),
};

// ── Admin ─────────────────────────────────────────────
export const adminApi = {
  getUsers: () =>
    fetch(`${BASE}/admin/users`, { headers: authHeaders() }).then(handleResponse),

  toggleUser: (id: string) =>
    fetch(`${BASE}/admin/users/${id}/toggle`, {
      method: "PUT",
      headers: authHeaders(),
    }).then(handleResponse),

  getStats: () =>
    fetch(`${BASE}/admin/stats`, { headers: authHeaders() }).then(handleResponse),
};
