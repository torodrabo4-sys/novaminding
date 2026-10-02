import { useState } from 'react'
import { supabase } from '../lib/supabase'
export default function Auth(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [isLogin,setIsLogin]=useState(true)
  const handle=async()=>{
    if(isLogin){
      const {error}=await supabase.auth.signInWithPassword({email,password})
      if(error) alert(error.message)
    }else{
      const {error}=await supabase.auth.signUp({email,password})
      if(error) alert(error.message)
      else alert('Compte créé! Vérifie ton email.')
    }
  }
  return(
    <div style={{maxWidth:'400px', margin:'80px auto', padding:'20px', fontFamily:'sans-serif'}}>
      <h1>NovaMinding</h1>
      <p>{isLogin?'Connexion':'Inscription'}</p>
      <input style={{width:'100%', padding:'12px', margin:'8px 0'}} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input style={{width:'100%', padding:'12px', margin:'8px 0'}} placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={handle} style={{width:'100%', padding:'12px', background:'black', color:'white', border:'none', borderRadius:'8px'}}>{isLogin?'Se connecter':'Créer compte'}</button>
      <p onClick={()=>setIsLogin(!isLogin)} style={{textAlign:'center', marginTop:'12px', textDecoration:'underline', cursor:'pointer'}}>{isLogin?'Pas de compte? Créer':'Déjà un compte? Connecte-toi'}</p>
    </div>
  )
}
