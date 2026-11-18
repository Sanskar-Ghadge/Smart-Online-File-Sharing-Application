import{useState,useCallback}from"react";
import{Upload,File}from"lucide-react";
import{motion,AnimatePresence}from"framer-motion";
import styles from"./FileDropZone.module.css";
const BLOCKED=[".exe",".bat",".sh",".msi",".vbs",".cmd",".scr",".ps1",".com"];
function isBlocked(n){return BLOCKED.some(e=>n.toLowerCase().endsWith(e));}
export default function FileDropZone({onFile}){
  const[dragging,setDragging]=useState(false);const[error,setError]=useState("");
  const handle=useCallback((file)=>{setError("");if(!file)return;if(isBlocked(file.name)){setError(`File type not allowed: .${file.name.split(".").pop()}`);return;}onFile(file);},[onFile]);
  return(
    <div className={`${styles.zone} ${dragging?styles.dragging:""}`}
      onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)}
      onDrop={e=>{e.preventDefault();setDragging(false);handle(e.dataTransfer.files[0]);}}
      onClick={()=>document.getElementById("fzInput").click()}>
      <input id="fzInput" type="file" className={styles.hidden} onChange={e=>{handle(e.target.files[0]);e.target.value="";}}/>
      <AnimatePresence mode="wait">
        {dragging?(
          <motion.div key="d" className={styles.inner} initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}}>
            <Upload size={32} className={styles.iconAccent}/><p className={styles.hint}>Drop it!</p>
          </motion.div>
        ):(
          <motion.div key="i" className={styles.inner} initial={{scale:0.9}} animate={{scale:1}}>
            <File size={32} className={styles.icon}/>
            <p className={styles.hint}>Click or drag a file here</p>
            <p className={styles.sub}>Any file except .exe .bat .sh and similar</p>
          </motion.div>
        )}
      </AnimatePresence>
      {error&&<p className={styles.error}>{error}</p>}
    </div>
  );
}
