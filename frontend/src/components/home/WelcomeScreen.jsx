import { motion } from "framer-motion";
import { MessageCircle, Users, FolderOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./WelcomeScreen.module.css";
const ACTIONS = [
  { icon: MessageCircle, label: "Start a chat",   desc: "Find a user and send a message", to: "/app/users",  color: "#5B8DEF" },
  { icon: FolderOpen,    label: "Share a file",   desc: "Send any file peer-to-peer",     to: "/app/chat",   color: "#22C55E" },
  { icon: Users,         label: "Create a group", desc: "Invite people and collaborate",  to: "/app/groups", color: "#7C3AED" },
];
export default function WelcomeScreen() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <motion.div className={styles.center} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
        <div className={styles.illustration}>
          <div className={styles.ring1}/><div className={styles.ring2}/>
          <MessageCircle size={40} className={styles.mainIcon}/>
        </div>
        <h2 className={styles.heading}>Welcome to SecureShare</h2>
        <p className={styles.sub}>Your messages and files are private.<br/>Select a conversation or get started below.</p>
        <div className={styles.actions}>
          {ACTIONS.map(({icon:Icon,label,desc,to,color},i)=>(
            <motion.button key={label} className={styles.action} onClick={()=>navigate(to)}
              initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08+0.2}}
              whileHover={{y:-3,boxShadow:"0 8px 24px rgba(0,0,0,0.10)"}}>
              <div className={styles.actionIcon} style={{background:color+"20",color}}><Icon size={20}/></div>
              <div className={styles.actionText}><span className={styles.actionLabel}>{label}</span><span className={styles.actionDesc}>{desc}</span></div>
              <ArrowRight size={16} className={styles.arrow}/>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
