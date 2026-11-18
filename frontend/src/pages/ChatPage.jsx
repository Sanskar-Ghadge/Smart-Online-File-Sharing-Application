import{useParams}from"react-router-dom";
import ConversationList from"../components/chat/ConversationList";
import ChatWindow from"../components/chat/ChatWindow";
import WelcomeScreen from"../components/home/WelcomeScreen";
import styles from"./ChatPage.module.css";
export default function ChatPage(){
  const{userId}=useParams();
  return(<div className={styles.layout}><ConversationList/><div className={styles.content}>{userId?<ChatWindow/>:<WelcomeScreen/>}</div></div>);
}
