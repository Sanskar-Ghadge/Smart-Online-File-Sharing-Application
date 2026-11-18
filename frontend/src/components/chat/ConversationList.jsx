import{useState,useEffect}from"react";
import{motion}from"framer-motion";
import{useNavigate,useParams}from"react-router-dom";
import{useAuth}from"../../context/AuthContext";
import{chatApi}from"../../api/chatApi";
import Avatar from"../ui/Avatar";
import ShimmerLoader from"../ui/ShimmerLoader";
import styles from"./ConversationList.module.css";
function timeAgo(iso){const mins=Math.floor((Date.now()-new Date(iso))/60000);if(mins<1)return"now";if(mins<60)return`${mins}m`;const h=Math.floor(mins/60);if(h<24)return`${h}h`;return`${Math.floor(h/24)}d`;}
export default function ConversationList(){
  const{token}=useAuth();const{userId}=useParams();const navigate=useNavigate();
  const[convs,setConvs]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{chatApi.getConversations(token).then(setConvs).finally(()=>setLoading(false));},[token]);
  return(
    <div className={styles.list}>
      <div className={styles.header}><h3 className={styles.title}>Messages</h3></div>
      {loading?<div className={styles.shimWrap}><ShimmerLoader rows={4} height={48} gap={8}/></div>:
      convs.map((c,i)=>(
        <motion.div key={c.id} className={`${styles.item} ${String(c.peerId)===userId?styles.active:""}`}
          initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
          onClick={()=>navigate(`/app/chat/${c.peerId}`)}>
          <div className={styles.avatarWrap}>
            <Avatar name={c.peerName} size={40}/>
            {c.unread>0&&<span className={styles.badge}>{c.unread}</span>}
          </div>
          <div className={styles.info}>
            <div className={styles.row1}><span className={styles.name}>{c.peerName}</span><span className={styles.time}>{timeAgo(c.lastTime)}</span></div>
            <span className={styles.last}>{c.lastMessage}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
