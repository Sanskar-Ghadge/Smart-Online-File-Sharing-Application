import{useState,useEffect,useRef}from"react";
import{useParams}from"react-router-dom";
import{useAuth}from"../../context/AuthContext";
import{chatApi}from"../../api/chatApi";
import{useOnlineUsers}from"../../hooks/useOnlineUsers";
import MessageBubble from"./MessageBubble";
import ChatInput from"./ChatInput";
import TypingDots from"../ui/TypingDots";
import Avatar from"../ui/Avatar";
import StatusBadge from"../ui/StatusBadge";
import FileAcceptModal from"../files/FileAcceptModal";
import FileTransferPanel from"../files/FileTransferPanel";
import ShimmerLoader from"../ui/ShimmerLoader";
import styles from"./ChatWindow.module.css";
export default function ChatWindow(){
  const{userId}=useParams();const{token,user}=useAuth();const{users}=useOnlineUsers();
  const peer=users.find(u=>String(u.id)===userId);
  const convId=`conv_${userId}`;
  const[messages,setMessages]=useState([]);const[loading,setLoading]=useState(true);
  const[typing,setTyping]=useState(false);const[showFilePanel,setShowFilePanel]=useState(false);
  const[incomingFile,setIncomingFile]=useState(null);
  const bottomRef=useRef(null);
  useEffect(()=>{setLoading(true);chatApi.getMessages(token,convId).then(setMessages).finally(()=>setLoading(false));},[token,convId]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  function sendMessage(text){
    const msg={id:`m_${Date.now()}`,senderId:user.id,text,time:new Date().toISOString(),type:"TEXT"};
    setMessages(prev=>[...prev,msg]);setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMessages(prev=>[...prev,{id:`mr_${Date.now()}`,senderId:parseInt(userId),text:"Got it! Thanks.",time:new Date().toISOString(),type:"TEXT"}]);
    },1500);
  }
  if(!userId)return null;
  return(
    <div className={styles.window}>
      <div className={styles.topBar}>
        {peer?(<><Avatar name={peer.username} size={36}/><div className={styles.peerInfo}><span className={styles.peerName}>{peer.username}</span><StatusBadge online label/></div></>):
        (<span className={styles.peerName}>User #{userId}</span>)}
      </div>
      <div className={styles.messages}>
        {loading?(<div className={styles.shimWrap}><ShimmerLoader rows={5} height={40} gap={12}/></div>):(
          <>{messages.map(m=><MessageBubble key={m.id} message={m} isOwn={m.senderId===user.id}/>)}
          {typing&&<div className={styles.typingWrap}><TypingDots/></div>}
          <div ref={bottomRef}/></>
        )}
      </div>
      {showFilePanel&&<FileTransferPanel peerName={peer?.username||"peer"} onClose={()=>setShowFilePanel(false)}/>}
      {incomingFile&&<FileAcceptModal file={incomingFile} onAccept={()=>setIncomingFile(null)} onReject={()=>setIncomingFile(null)}/>}
      <ChatInput onSend={sendMessage} onFileSelect={()=>setShowFilePanel(true)} disabled={loading}/>
    </div>
  );
}
