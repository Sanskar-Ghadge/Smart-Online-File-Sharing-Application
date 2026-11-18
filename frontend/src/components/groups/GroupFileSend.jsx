import{useState,useCallback}from"react";
import{Users}from"lucide-react";
import FileDropZone from"../files/FileDropZone";
import FileProgressBar from"../files/FileProgressBar";
import styles from"./GroupFileSend.module.css";
export default function GroupFileSend({members=[]}){
  const[file,setFile]=useState(null);const[mp,setMp]=useState({});
  const handleFile=useCallback((f)=>{
    setFile(f);const t=Math.ceil(f.size/(512*1024))||1;
    const init={};members.forEach(m=>{init[m.id]={chunks:0,total:t,progress:0,status:"transferring"};});setMp(init);
    members.forEach(m=>{let c=0;const d=Math.random()*40;const iv=setInterval(()=>{c++;setMp(p=>({...p,[m.id]:{chunks:c,total:t,progress:c/t,status:c>=t?"done":"transferring"}}));if(c>=t)clearInterval(iv);},80+d);});
  },[members]);
  return(
    <div className={styles.wrap}>
      <div className={styles.header}><Users size={16}/><span>Group File Share</span></div>
      {!file?<FileDropZone onFile={handleFile}/>:(
        <div className={styles.list}>
          {members.map(m=>{const p=mp[m.id]||{chunks:0,total:1,progress:0,status:"transferring"};return(
            <div key={m.id} className={styles.memberRow}>
              <span className={styles.memberName}>{m.username}</span>
              <FileProgressBar fileName={file.name} progress={p.progress} chunks={p.chunks} totalChunks={p.total} status={p.status}/>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}