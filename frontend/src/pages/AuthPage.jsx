import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Users, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../components/auth/LoginPage";
import RegisterPage from "../components/auth/RegisterPage";
import styles from "./AuthPage.module.css";
const FEATURES = [
  { icon: Lock,  text: "End-to-end encrypted transfers"  },
  { icon: Zap,   text: "Direct peer-to-peer connections" },
  { icon: Users, text: "Group file sharing and chat"     },
];
export default function AuthPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState("login");
  if (loading) return null;
  if (user) return <Navigate to="/app/chat" replace />;
  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}><Shield size={32}/></div>
          <h1 className={styles.brandName}>SecureShare</h1>
          <p className={styles.brandTag}>Private. Fast. P2P.</p>
        </div>
        <div className={styles.features}>
          {FEATURES.map(({icon:Icon,text})=>(
            <div key={text} className={styles.feature}>
              <div className={styles.featureIcon}><Icon size={18}/></div>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div className={styles.blob1}/><div className={styles.blob2}/>
      </div>
      <div className={styles.right}>
        <div className={styles.formCard}>
          <AnimatePresence mode="wait">
            {mode==="login"?(
              <motion.div key="login" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.22}}>
                <LoginPage onSwitch={()=>setMode("register")}/>
              </motion.div>
            ):(
              <motion.div key="register" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.22}}>
                <RegisterPage onSwitch={()=>setMode("login")}/>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
