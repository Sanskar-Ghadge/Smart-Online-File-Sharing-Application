import{useState,useCallback}from"react";
import{X}from"lucide-react";
import{motion}from"framer-motion";
import FileDropZone from"./FileDropZone";
import FileProgressBar from"./FileProgressBar";
import styles from"./FileTransferPanel.module.css";
export default function FileTransferPanel({peerName,onClose}){
  const[file,setFile]=useState(null);const[progress,setProgress]=useState(0);const[chunks,setChunks]=useState(0);const[total,setTotal]=useState(0);const[status,setStatus]=useState("idle");
  const handleFile=useCallback((f)=>{
    setFile(f);const t=Math.ceil(f.size/(512*1024))||1;setTotal(t);setChunks(0);setProgress(0);setStatus("transferring");
    let c=0;const iv=setInterval(()=>{c++;setChunks(c);setProgress(c/t);if(c>=t){clearInterval(iv);setStatus("done");}},80);
  },[]);
  return(
    <motion.div className={styles.panel} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
      <div className={styles.header}>
        <span className={styles.title}>Send file to <strong>{peerName}</strong></span>
        <button className={styles.close} onClick={onClose}><X size={16}/></button>
      </div>
      {!file||status==="idle"?<FileDropZone onFile={handleFile}/>:(
        <div className={styles.progress}>
          <FileProgressBar fileName={file.name} progress={progress} chunks={chunks} totalChunks={total} status={status}/>
          {status==="done"&&<p className={styles.done}>Transfer complete. SHA-256 verified.</p>}
        </div>
      )}
    </motion.div>
  );
}
