const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const MOCK_ONLINE_USERS = [
  { id: 2, username: "alice_smith", email: "alice@example.com", status: "ONLINE" },
  { id: 3, username: "bob_jones",   email: "bob@example.com",   status: "ONLINE" },
  { id: 4, username: "carol_white", email: "carol@example.com", status: "ONLINE" },
  { id: 5, username: "dave_black",  email: "dave@example.com",  status: "ONLINE" },
];

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

export const usersApi = {
  async getOnlineUsers(token) {
    if (USE_MOCK) { await delay(400); return MOCK_ONLINE_USERS; }
    const res = await fetch(`${API_BASE}/api/users/online`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch online users");
    return res.json();
  },
};
