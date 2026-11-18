import styles from "./ShimmerLoader.module.css";

export default function ShimmerLoader({ rows = 3, height = 16, gap = 12, className = "" }) {
  return (
    <div className={`${styles.wrapper} ${className}`} style={{ gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={styles.shimmer}
          style={{ height, width: i === rows - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}
