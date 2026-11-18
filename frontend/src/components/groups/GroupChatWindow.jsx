import{useState}from"react";
import{Users,Share2}from"lucide-react";
import MessageBubble from"../chat/MessageBubble";
import ChatInput from"../chat/ChatInput";
import GroupFileSend from"./GroupFileSend";
import{useAuth}from"../../context/AuthContext";
import styles from"./GroupChatWindow.module.css";
const INIT=[
  {id:"gm1",senderId:2,senderName:"alice_smith",text:"Hey team! Ready for the file share?",time:new Date(Date.now()-10*60000).toISOString()},
  {id:"gm2",senderId:3,senderName:"bob_jones",text:"Yes, go ahead!",time:new Date(Date.now()-8*60000).toISOString()},
];
export default function GroupChatWindow({group}){
  const{user}=useAuth();const[messages,setMessages]=useState(INIT);const[showFiles,setShowFiles]=useState(false);
  if(!group)return<div className={styles.empty}><Users size={40} style={{color:"#9CA3AF"}}/><p>Select a group</p></div>;
  function sendMessage(text){setMessages(p=>[...p,{id:`gm_${Date.now()}`,senderId:user.id,senderName:user.username,text,time:new Date().toISOString()}]);}
  return(
    <div className={styles.window}>
      <div className={styles.topBar}>
        <div className={styles.icon}><Users size={18}/></div>
        <div className={styles.info}><span className={styles.name}>{group.name}</span><span className={styles.members}>{group.members.length} members</span></div>
        <button className={styles.shareBtn} onClick={()=>setShowFiles(s=>!s)} title="Share file with group"><Share2 size={18}/></button>
      </div>
      {showFiles&&<GroupFileSend members={group.members}/>}
      <div className={styles.messages}>
        {messages.map(m=>(
          <div key={m.id} className={styles.msgRow}>
            {m.senderId!==user.id&&<span className={styles.sender}>{m.senderName}</span>}
            <MessageBubble message={m} isOwn={m.senderId===user.id}/>
          </div>
        ))}
      </div>
      <ChatInput onSend={sendMessage}/>
    </div>
  );
}