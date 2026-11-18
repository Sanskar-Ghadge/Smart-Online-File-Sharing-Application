import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import AppShell from "../components/layout/AppShell";
export default function MainPage() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <SocketProvider><AppShell /></SocketProvider>;
}
