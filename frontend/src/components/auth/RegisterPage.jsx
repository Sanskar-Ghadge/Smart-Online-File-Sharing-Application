import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import styles from "./AuthForms.module.css";
export default function RegisterPage({ onSwitch }) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try { await register(username, email, password); toast.success("Account created! Welcome to SecureShare"); }
    catch (err) { setError(err.message || "Registration failed"); }
    finally { setLoading(false); }
  }
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>Create account</h2>
      <p className={styles.sub}>Join SecureShare - free and private</p>
      {error && <motion.div className={styles.error} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>{error}</motion.div>}
      <div className={styles.field}>
        <label className={styles.label}>Username</label>
        <div className={styles.inputWrap}>
          <User size={16} className={styles.icon}/>
          <input className={styles.input} type="text" placeholder="your_username" value={username} onChange={e=>setUsername(e.target.value)} required minLength={3} maxLength={50} autoComplete="username"/>
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <div className={styles.inputWrap}>
          <Mail size={16} className={styles.icon}/>
          <input className={styles.input} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Password</label>
        <div className={styles.inputWrap}>
          <Lock size={16} className={styles.icon}/>
          <input className={styles.input} type={showPw?"text":"password"} placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} autoComplete="new-password"/>
          <button type="button" className={styles.eyeBtn} onClick={()=>setShowPw(s=>!s)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
        </div>
        {password.length > 0 && (
          <div className={styles.strengthBar}>
            <div className={styles.strengthFill} style={{width:`${Math.min((password.length/12)*100,100)}%`,background:password.length<6?"var(--danger)":password.length<10?"var(--yellow)":"var(--green)"}}/>
          </div>
        )}
      </div>
      <motion.button className={styles.submitBtn} type="submit" disabled={loading} whileTap={{scale:0.97}}>
        {loading?<Loader size={18} className={styles.spinner}/>:<><span>Create account</span><ArrowRight size={16}/></>}
      </motion.button>
      <p className={styles.switchText}>Already have an account?{" "}<button type="button" className={styles.switchBtn} onClick={onSwitch}>Sign in</button></p>
    </form>
  );
}
