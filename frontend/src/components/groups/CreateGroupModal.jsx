import{useState}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{Check}from"lucide-react";
import Modal from"../ui/Modal";
import Avatar from"../ui/Avatar";
import{useAuth}from"../../context/AuthContext";
import{useOnlineUsers}from"../../hooks/useOnlineUsers";
import{groupsApi}from"../../api/groupsApi";
import toast from"react-hot-toast";
import styles from"./CreateGroupModal.module.css";
export default function CreateGroupModal({open,onClose,onCreated}){
  const{token}=useAuth();const{users}=useOnlineUsers();
  const[step,setStep]=useState(1);const[name,setName]=useState("");const[selected,setSelected]=useState([]);const[loading,setLoading]=useState(false);
  function toggle(id){setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);}
  async function create(){
    if(!name.trim())return;setLoading(true);
    try{const g=await groupsApi.createGroup(token,name,selected);toast.success(`Group "${g.name}" created!`);onCreated?.(g);onClose();setStep(1);setName("");setSelected([]);}
    catch(e){toast.error(e.message);}finally{setLoading(false);}
  }
  return(
    <Modal open={open} onClose={onClose} title="Create Group" width={440}>
      <div className={styles.steps}>
        <div className={`${styles.step} ${step===1?styles.stepActive:styles.stepDone}`}>1. Name</div>
        <div className={styles.stepLine}/>
        <div className={`${styles.step} ${step===2?styles.stepActive:""}`}>2. Invite</div>
      </div>
      <AnimatePresence mode="wait">
        {step===1?(
          <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <input className={styles.input} placeholder="Group name..." value={name} onChange={e=>setName(e.target.value)} autoFocus/>
            <button className={styles.next} disabled={!name.trim()} onClick={()=>setStep(2)}>Next</button>
          </motion.div>
        ):(
          <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <p className={styles.label}>Select members to invite</p>
            <div className={styles.userList}>
              {users.map(u=>(
                <div key={u.id} className={`${styles.userRow} ${selected.includes(u.id)?styles.sel:""}`} onClick={()=>toggle(u.id)}>
                  <Avatar name={u.username} size={32}/><span className={styles.uname}>{u.username}</span>
                  {selected.includes(u.id)&&<Check size={16} className={styles.check}/>}
                </div>
              ))}
            </div>
            <div className={styles.footer}>
              <button className={styles.back} onClick={()=>setStep(1)}>Back</button>
              <button className={styles.createBtn} disabled={loading} onClick={create}>{loading?"Creating...":`Create (${selected.length} members)`}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}