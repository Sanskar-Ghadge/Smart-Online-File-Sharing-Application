import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import styles from "./AuthForms.module.css";
export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(email, password); toast.success("Welcome back!"); }
    catch (err) { setError(err.message || "Login failed"); }
    finally { setLoading(false); }
  }
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>Sign in</h2>
      <p className={styles.sub}>Welcome back to SecureShare</p>
      {error && <motion.div className={styles.error} initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }}>{error}</motion.div>}
      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <div className={styles.inputWrap}>
          <Mail size={16} className={styles.icon} />
          <input className={styles.input} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Password</label>
        <div className={styles.inputWrap}>
          <Lock size={16} className={styles.icon} />
          <input className={styles.input} type={showPw?"text":"password"} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
          <button type="button" className={styles.eyeBtn} onClick={()=>setShowPw(s=>!s)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
        </div>
      </div>
      <motion.button className={styles.submitBtn} type="submit" disabled={loading} whileTap={{scale:0.97}}>
        {loading ? <Loader size={18} className={styles.spinner}/> : <><span>Sign in</span><ArrowRight size={16}/></>}
      </motion.button>
      <p className={styles.switchText}>Don&apos;t have an account?{" "}<button type="button" className={styles.switchBtn} onClick={onSwitch}>Create one</button></p>
    </form>
  );
}
