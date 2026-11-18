import { Wifi, WifiOff, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../ui/Avatar";
import styles from "./TopBar.module.css";

export default function TopBar({ title = "Secure P2P" }) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <Shield size={20} className={styles.logo} />
        <span className={styles.appName}>SecureShare</span>
        {title !== "Secure P2P" && (<><span className={styles.divider}>/</span><span className={styles.title}>{title}</span></>)}
      </div>
      <div className={styles.right}>
        <motion.div className={`${styles.connStatus} ${connected ? styles.connected : styles.disconnected}`} initial={false} animate={{ scale: [1,1.05,1] }} transition={{ duration: 0.3 }} key={String(connected)}>
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{connected ? "Connected" : "Offline"}</span>
        </motion.div>
        {user && (
          <div className={styles.userArea}>
            <Avatar name={user.username} size={30} />
            <span className={styles.username}>{user.username}</span>
            <button className={styles.logoutBtn} onClick={logout} title="Sign out"><LogOut size={16} /></button>
          </div>
        )}
      </div>
    </header>
  );
}
