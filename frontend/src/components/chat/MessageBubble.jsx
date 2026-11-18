import { motion } from "framer-motion";
import styles from "./MessageBubble.module.css";
function fmt(iso){const d=new Date(iso);return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});}
export default function MessageBubble({message,isOwn}){
  return(
    <motion.div className={`${styles.wrap} ${isOwn?styles.own:styles.other}`}
      initial={{opacity:0,y:8,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
      transition={{type:"spring",stiffness:400,damping:28}}>
      <div className={`${styles.bubble} ${isOwn?styles.bubbleOwn:styles.bubbleOther}`}>
        {message.text&&<p className={styles.text}>{message.text}</p>}
        {message.fileName&&<div className={styles.file}><span>📎</span><span className={styles.fileName}>{message.fileName}</span></div>}
        <span className={styles.time}>{fmt(message.time)}</span>
      </div>
    </motion.div>
  );
}
