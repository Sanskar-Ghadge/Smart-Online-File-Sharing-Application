import { useState, useEffect, useCallback } from "react";
import { usersApi } from "../api/usersApi";
import { useAuth } from "./useAuth";

export function useOnlineUsers(intervalMs = 15000) {
  const { token } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!token) return;
    try {
      const list = await usersApi.getOnlineUsers(token);
      setUsers(list);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, intervalMs);
    return () => clearInterval(id);
  }, [fetch, intervalMs]);

  return { users, loading, error, refetch: fetch };
}
