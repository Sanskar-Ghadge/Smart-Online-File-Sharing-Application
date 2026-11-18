import { motion } from "framer-motion";
import styles from "./AnimatedCard.module.css";

export default function AnimatedCard({ children, className = "", onClick, padding = true }) {
  return (
    <motion.div
      className={`${styles.card} ${padding ? styles.padded : ""} ${className}`}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {children}
    </motion.div>
  );
}
