import{useState,useEffect}from"react";
import{motion}from"framer-motion";
import{Plus,Users}from"lucide-react";
import{useAuth}from"../../context/AuthContext";
import{groupsApi}from"../../api/groupsApi";
import CreateGroupModal from"./CreateGroupModal";
import GroupInviteBanner from"./GroupInviteBanner";
import ShimmerLoader from"../ui/ShimmerLoader";
import styles from"./GroupList.module.css";
export default function GroupList({onSelect,selected}){
  const{token}=useAuth();const[groups,setGroups]=useState([]);const[loading,setLoading]=useState(true);const[showCreate,setShowCreate]=useState(false);
  useEffect(()=>{groupsApi.getGroups(token).then(setGroups).finally(()=>setLoading(false));},[token]);
  return(
    <div className={styles.list}>
      <GroupInviteBanner/>
      <div className={styles.header}><h3 className={styles.title}>Groups</h3><button className={styles.createBtn} onClick={()=>setShowCreate(true)}><Plus size={16}/></button></div>
      {loading?<div className={styles.shimWrap}><ShimmerLoader rows={3} height={56} gap={8}/></div>:
      groups.map((g,i)=>(
        <motion.div key={g.id} className={`${styles.item} ${selected===g.id?styles.active:""}`}
          initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}} onClick={()=>onSelect(g)}>
          <div className={styles.icon}><Users size={18}/></div>
          <div className={styles.info}><span className={styles.name}>{g.name}</span><span className={styles.count}>{g.members.length} members</span></div>
        </motion.div>
      ))}
      <CreateGroupModal open={showCreate} onClose={()=>setShowCreate(false)} onCreated={g=>setGroups(p=>[...p,g])}/>
    </div>
  );
}