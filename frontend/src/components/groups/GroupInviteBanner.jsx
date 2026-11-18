import{motion,AnimatePresence}from"framer-motion";
import{Bell,Check,X}from"lucide-react";
import{useState,useEffect}from"react";
import{useAuth}from"../../context/AuthContext";
import{groupsApi}from"../../api/groupsApi";
import toast from"react-hot-toast";
import styles from"./GroupInviteBanner.module.css";
export default function GroupInviteBanner(){
  const{token}=useAuth();const[invites,setInvites]=useState([]);
  useEffect(()=>{
    groupsApi.getPendingInvites(token).then(setInvites).catch(()=>{});
    const id=setInterval(()=>groupsApi.getPendingInvites(token).then(setInvites).catch(()=>{}),30000);
    return()=>clearInterval(id);
  },[token]);
  async function accept(inv){await groupsApi.acceptInvite(token,inv.id);setInvites(p=>p.filter(i=>i.id!==inv.id));toast.success(`Joined ${inv.groupName}!`);}
  async function reject(inv){await groupsApi.rejectInvite(token,inv.id);setInvites(p=>p.filter(i=>i.id!==inv.id));}
  return(
    <div className={styles.stack}>
      <AnimatePresence>
        {invites.map(inv=>(
          <motion.div key={inv.id} className={styles.banner}
            initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}>
            <Bell size={16} className={styles.icon}/>
            <div className={styles.text}><strong>{inv.invitedBy}</strong> invited you to <strong>{inv.groupName}</strong></div>
            <div className={styles.actions}>
              <button className={styles.accept} onClick={()=>accept(inv)}><Check size={14}/></button>
              <button className={styles.reject} onClick={()=>reject(inv)}><X size={14}/></button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}