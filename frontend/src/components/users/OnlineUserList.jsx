import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RefreshCw, MessageCircle } from "lucide-react";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";
import ShimmerLoader from "../ui/ShimmerLoader";
import CountUp from "../ui/CountUp";
import styles from "./OnlineUserList.module.css";
export default function OnlineUserList() {
  const {users,loading,refetch}=useOnlineUsers(15000);
  const navigate=useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h2 className={styles.title}>Online Users</h2><p className={styles.sub}>{loading?"Loading...":<><CountUp to={users.length} duration={500}/> users online</>}</p></div>
        <button className={styles.refresh} onClick={refetch} title="Refresh"><RefreshCw size={16}/></button>
      </div>
      <div className={styles.list}>
        {loading?(<div className={styles.shimWrap}><ShimmerLoader rows={6} height={52} gap={8}/></div>):
        users.length===0?(<div className={styles.empty}>No users online right now</div>):(
          <AnimatePresence>
            {users.map((u,i)=>(
              <motion.div key={u.id} className={styles.card}
                initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                transition={{delay:i*0.05}} whileHover={{y:-2}}>
                <Avatar name={u.username} size={44}/>
                <div className={styles.info}><span className={styles.name}>{u.username}</span><StatusBadge online label/></div>
                <button className={styles.chatBtn} onClick={()=>navigate(`/app/chat/${u.id}`)} title="Send message"><MessageCircle size={18}/></button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
