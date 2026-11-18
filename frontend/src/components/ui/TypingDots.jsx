import { motion } from "framer-motion";
import styles from "./TypingDots.module.css";

const DOT = { y: [0, -6, 0] };
const TRANSITION = (i) => ({ duration: 0.6, repeat: Infinity, delay: i * 0.15 });

export default function TypingDots() {
  return (
    <div className={styles.wrapper}>
      {[0, 1, 2].map(i => (
        <motion.span key={i} className={styles.dot} animate={DOT} transition={TRANSITION(i)} />
      ))}
    </div>
  );
}
