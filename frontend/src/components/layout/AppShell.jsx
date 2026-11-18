import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import styles from "./AppShell.module.css";
export default function AppShell() {
  return (
    <motion.div className={styles.shell} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <TopBar />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}><Outlet /></main>
      </div>
    </motion.div>
  );
}
