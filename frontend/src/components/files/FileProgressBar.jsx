import{motion}from"framer-motion";
import styles from"./FileProgressBar.module.css";
export default function FileProgressBar({fileName,progress,chunks,totalChunks,status="transferring"}){
  const pct=Math.round(progress*100);
  const color=status==="done"?"var(--green)":status==="error"?"var(--danger)":"var(--accent)";
  return(
    <div className={styles.wrap}>
      <div className={styles.row}><span className={styles.name}>{fileName}</span><span className={styles.pct} style={{color}}>{pct}%</span></div>
      <div className={styles.track}><motion.div className={styles.fill} style={{background:color}} animate={{width:`${pct}%`}} transition={{duration:0.4}}/></div>
      <div className={styles.meta}><span>{status==="done"?"Transfer complete":status==="error"?"Error":`Chunk ${chunks} / ${totalChunks}`}</span></div>
    </div>
  );
}
