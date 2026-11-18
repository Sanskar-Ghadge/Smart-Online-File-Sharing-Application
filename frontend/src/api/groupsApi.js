const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

const MOCK_GROUPS = [
  {
    id: "grp_1",
    name: "Project Alpha",
    creatorId: 1,
    members: [
      { id: 1, username: "demo_user", status: "ACCEPTED" },
      { id: 2, username: "alice_smith", status: "ACCEPTED" },
      { id: 3, username: "bob_jones", status: "ACCEPTED" },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const MOCK_INVITES = [
  {
    id: "inv_1",
    groupId: "grp_2",
    groupName: "Design Team",
    invitedBy: "carol_white",
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
  },
];

export const groupsApi = {
  async getGroups(token) {
    if (USE_MOCK) { await delay(300); return MOCK_GROUPS; }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/group/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async getPendingInvites(token) {
    if (USE_MOCK) { await delay(200); return MOCK_INVITES; }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/group/invites/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async createGroup(token, name, memberIds) {
    if (USE_MOCK) {
      await delay(600);
      return { id: "grp_" + Date.now(), name, creatorId: 1, members: [], createdAt: new Date().toISOString() };
    }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/group/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, memberIds }),
    });
    return res.json();
  },

  async acceptInvite(token, inviteId) {
    if (USE_MOCK) { await delay(300); return { success: true }; }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/group/accept/${inviteId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async rejectInvite(token, inviteId) {
    if (USE_MOCK) { await delay(300); return { success: true }; }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/group/reject/${inviteId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
