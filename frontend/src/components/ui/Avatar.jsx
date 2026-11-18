import styles from "./Avatar.module.css";

const COLORS = [
  ["#EEF3FD","#3D6FD1"],["#DCFCE7","#15803D"],["#FEF9C3","#854D0E"],
  ["#FEE2E2","#B91C1C"],["#F3E8FF","#7E3AF2"],["#E0F2FE","#0B6DA2"],
  ["#FEE2D5","#C2410C"],["#ECFDF5","#065F46"],
];

function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function Avatar({ name = "?", size = 36, className = "" }) {
  const initial = name.charAt(0).toUpperCase();
  const [bg, fg] = hashColor(name);
  return (
    <div
      className={`${styles.avatar} ${className}`}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.4 }}
      title={name}
    >
      {initial}
    </div>
  );
}
