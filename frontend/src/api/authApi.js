const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const MOCK_USER = { id: 1, username: "demo_user", email: "demo@example.com" };
const MOCK_TOKEN = "mock-jwt-token-demo";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

export const authApi = {
  async login(email, password) {
    if (USE_MOCK) {
      await delay(600);
      if (password.length < 3) throw new Error("Invalid credentials");
      return { token: MOCK_TOKEN, user: MOCK_USER };
    }
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(username, email, password) {
    if (USE_MOCK) {
      await delay(800);
      return { token: MOCK_TOKEN, user: { id: 2, username, email } };
    }
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },

  async me(token) {
    if (USE_MOCK) {
      await delay(200);
      if (token === MOCK_TOKEN) return MOCK_USER;
      throw new Error("Invalid token");
    }
    return request("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
