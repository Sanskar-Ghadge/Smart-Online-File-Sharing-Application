const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

const MOCK_CONVERSATIONS = [
  {
    id: "conv_2",
    peerId: 2,
    peerName: "alice_smith",
    lastMessage: "Hey! Are you there?",
    lastTime: new Date(Date.now() - 5 * 60000).toISOString(),
    unread: 2,
  },
  {
    id: "conv_3",
    peerId: 3,
    peerName: "bob_jones",
    lastMessage: "Sure, sending the file now.",
    lastTime: new Date(Date.now() - 25 * 60000).toISOString(),
    unread: 0,
  },
];

const MOCK_MESSAGES = {
  conv_2: [
    { id: "m1", senderId: 2, text: "Hi there!", time: new Date(Date.now() - 10 * 60000).toISOString(), type: "TEXT" },
    { id: "m2", senderId: 1, text: "Hello! How are you?", time: new Date(Date.now() - 8 * 60000).toISOString(), type: "TEXT" },
    { id: "m3", senderId: 2, text: "Hey! Are you there?", time: new Date(Date.now() - 5 * 60000).toISOString(), type: "TEXT" },
  ],
  conv_3: [
    { id: "m4", senderId: 1, text: "Can you send me the report?", time: new Date(Date.now() - 30 * 60000).toISOString(), type: "TEXT" },
    { id: "m5", senderId: 3, text: "Sure, sending the file now.", time: new Date(Date.now() - 25 * 60000).toISOString(), type: "TEXT" },
  ],
};

export const chatApi = {
  async getConversations(token) {
    if (USE_MOCK) { await delay(300); return MOCK_CONVERSATIONS; }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async getMessages(token, conversationId) {
    if (USE_MOCK) { await delay(200); return MOCK_MESSAGES[conversationId] || []; }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
