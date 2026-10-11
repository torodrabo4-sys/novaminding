import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [country,setCountry]=useState('Mali')
  const [phone,setPhone]=useState('')
  const [day,setDay]=useState('15')
  const [month,setMonth]=useState('06')
  const [year,setYear]=useState('1998')
  const [isLogin,setIsLogin]=useState(true)

  const handle=async()=>{
    if(isLogin){
      const {error}=await supabase.auth.signInWithPassword({email,password})
      if(error) alert(error.message)
    }else{
      const {data,error}=await supabase.auth.signUp({
        email,password,
        options:{data:{country,[STRIPPED]
      })
      if(error) alert(error.message)
      else {
        if(data.user){
          await supabase.from('profiles').insert({
            id:data.user.id,
            email:email,
            country:country,
            phone:phone,
            birth_day:parseInt(day),
            birth_month:parseInt(month),
            birth_year:parseInt(year)
          })
        }
        alert('Compte créé! Pays:'+country+' Tel:'+phone+' Né le:'+day+'/'+month+'/'+year+'. Vérifie ton email.')
      }
    }
  }
  
  return(
    <div style={{maxWidth:'400px', margin:'80px auto', padding:'20px', fontFamily:'sans-serif'}}>
      <h1>NovaMinding</h1>
      <p>{isLogin?'Connexion':'Inscription V22 - Internationale'}</p>
      <input style={{width:'100%', padding:'12px', margin:'8px 0'}} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input style={{width:'100%', padding:'12px', margin:'8px 0'}} placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      
      {!isLogin && (
        <>
          <select style={{width:'100%', padding:'12px', margin:'8px 0'}} value={country} onChange={e=>setCountry(e.target.value)}>
            <option>Mali</option>
            <option>Sénégal</option>
            <option>Côte d'Ivoire</option>
            <option>Burkina Faso</option>
            <option>Guinée</option>
            <option>Niger</option>
            <option>Togo</option>
            <option>Bénin</option>
            <option>Cameroun</option>
            <option>Congo</option>
            <option>RDC</option>
            <option>Gabon</option>
            <option>Tchad</option>
            <option>Mauritanie</option>
            <option>Maroc</option>
            <option>Algérie</option>
            <option>Tunisie</option>
            <option>France</option>
            <option>Belgique</option>
            <option>Canada</option>
            <option>USA</option>
            <option>Allemagne</option>
            <option>Espagne</option>
            <option>Italie</option>
            <option>Royaume-Uni</option>
            <option>Brésil</option>
            <option>Inde</option>
            <option>Chine</option>
            <option>Dubai - UAE</option>
            <option>Autre</option>
          </select>
          <input style={{width:'100%', padding:'12px', margin:'8px 0'}} placeholder="Téléphone +223..." value={phone} onChange={e=>setPhone(e.target.value)} />
          <div style={{display:'flex', gap:'8px'}}>
            <input style={{width:'33%', padding:'12px'}} placeholder="Jour" value={day} onChange={e=>setDay(e.target.value)} />
            <input style={{width:'33%', padding:'12px'}} placeholder="Mois" value={month} onChange={e=>setMonth(e.target.value)} />
            <input style={{width:'33%', padding:'12px'}} placeholder="Année" value={year} onChange={e=>setYear(e.target.value)} />
          </div>
        </>
      )}
      
      <button onClick={handle} style={{width:'100%', padding:'12px', background:'black', color:'white', border:'none', marginTop:'10px'}}>{isLogin?'Se connecter':"S'inscrire"}</button>
      <p onClick={()=>setIsLogin(!isLogin)} style={{textAlign:'center', marginTop:'12px', textDecoration:'underline', cursor:'pointer'}}>{isLogin?'Pas de compte ? Inscription':'Déjà compte ? Connexion'}</p>
    </div>
  )
              }
