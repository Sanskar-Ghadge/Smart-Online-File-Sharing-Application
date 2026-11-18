import{useState,useRef}from"react";
import{Send,Paperclip}from"lucide-react";
import{motion}from"framer-motion";
import styles from"./ChatInput.module.css";
export default function ChatInput({onSend,onFileSelect,disabled}){
  const[text,setText]=useState("");
  const fileRef=useRef(null);
  function handleKey(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}
  function submit(){const t=text.trim();if(!t)return;onSend(t);setText("");}
  return(
    <div className={styles.bar}>
      <button className={styles.attachBtn} onClick={()=>fileRef.current?.click()} disabled={disabled}><Paperclip size={18}/></button>
      <input type="file" ref={fileRef} className={styles.fileInput} onChange={e=>{if(e.target.files[0]){onFileSelect?.(e.target.files[0]);e.target.value="";}}}/>
      <textarea className={styles.input} placeholder="Type a message... (Enter to send)" value={text} onChange={e=>setText(e.target.value)} onKeyDown={handleKey} rows={1} disabled={disabled}/>
      <motion.button className={styles.sendBtn} onClick={submit} disabled={!text.trim()||disabled} whileTap={{scale:0.92}}><Send size={18}/></motion.button>
    </div>
  );
}
