import { NavLink } from "react-router-dom";
import { MessageCircle, FolderOpen, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";
import ShimmerLoader from "../ui/ShimmerLoader";
import CountUp from "../ui/CountUp";
import styles from "./Sidebar.module.css";

const NAV = [
  { to: "/app/chat",   icon: MessageCircle, label: "Messages" },
  { to: "/app/groups", icon: FolderOpen,    label: "Groups"   },
  { to: "/app/users",  icon: Users,         label: "Users"    },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { users, loading } = useOnlineUsers(20000);
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.divider} />
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Online Now</span>
          {!loading && <span className={styles.count}><CountUp to={users.length} duration={600} /></span>}
        </div>
        <div className={styles.userList}>
          {loading ? <ShimmerLoader rows={4} height={14} gap={14} /> : (
            <AnimatePresence>
              {users.map((u, i) => (
                <motion.div key={u.id} className={styles.userRow}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <div className={styles.avatarWrap}>
                    <Avatar name={u.username} size={32} />
                    <span className={styles.onlineDot} />
                  </div>
                  <span className={styles.userName}>{u.username}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      {user && (
        <div className={styles.footer}>
          <Avatar name={user.username} size={34} />
          <div className={styles.footerInfo}>
            <span className={styles.footerName}>{user.username}</span>
            <StatusBadge online label />
          </div>
        </div>
      )}
    </aside>
  );
}
