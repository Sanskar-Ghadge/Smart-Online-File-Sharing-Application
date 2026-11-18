import styles from "./StatusBadge.module.css";

export default function StatusBadge({ online = true, label = true }) {
  return (
    <span className={`${styles.badge} ${online ? styles.online : styles.offline}`}>
      <span className={styles.dot} />
      {label && <span className={styles.label}>{online ? "Online" : "Offline"}</span>}
    </span>
  );
}
