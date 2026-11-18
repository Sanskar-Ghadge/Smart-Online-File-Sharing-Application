import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

export default function Modal({ open, onClose, title, children, width = 480 }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className={styles.panel}
            style={{ maxWidth: width }}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.header}>
              <span className={styles.title}>{title}</span>
              <button className={styles.close} onClick={onClose}><X size={18} /></button>
            </div>
            <div className={styles.body}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
