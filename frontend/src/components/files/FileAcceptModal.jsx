import{motion,AnimatePresence}from"framer-motion";
import{FileText,Check,X}from"lucide-react";
import styles from"./FileAcceptModal.module.css";
function fmt(b){if(!b)return"";if(b<1024)return`${b} B`;if(b<1048576)return`${(b/1024).toFixed(1)} KB`;return`${(b/1048576).toFixed(1)} MB`;}
export default function FileAcceptModal({file,onAccept,onReject}){
  return(
    <AnimatePresence>
      {file&&(
        <motion.div className={styles.overlay} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <motion.div className={styles.card} initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} transition={{type:"spring",stiffness:340,damping:26}}>
            <div className={styles.icon}><FileText size={28}/></div>
            <h3 className={styles.title}>Incoming File</h3>
            <p className={styles.from}>from <strong>{file.from}</strong></p>
            <div className={styles.meta}><span className={styles.fileName}>{file.name}</span>{file.size&&<span className={styles.fileSize}>{fmt(file.size)}</span>}</div>
            <div className={styles.actions}>
              <button className={styles.reject} onClick={onReject}><X size={16}/> Decline</button>
              <button className={styles.accept} onClick={onAccept}><Check size={16}/> Accept</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
