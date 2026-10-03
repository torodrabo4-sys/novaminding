import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
export default function Dashboard(){
  const [balance,setBalance]=useState(45000)
  const boost=(price)=>{
    if(balance<price){ alert('Solde insuffisant. Vendez d\'abord !'); return }
    setBalance(balance-price)
    alert(`🚀 Boost activé avec ${price} XOF ! Votre boutique passe en tête d'accueil pendant 24h.`)
  }
  return(
    <div style={{fontFamily:'sans-serif', padding:'20px', maxWidth:'900px', margin:'0 auto'}}>
      <h2>Seller Center</h2>
      <div style={{background:'black', color:'white', padding:'20px', borderRadius:'12px', marginTop:'15px'}}>
        <p style={{margin:0, opacity:0.7}}>Mon Wallet (après commission 10%)</p>
        <h1 style={{margin:'10px 0'}}>{balance} XOF</h1>
        <p style={{fontSize:'12px', opacity:0.7}}>Ventes brutes: 50.000 XOF | Commission NovaMinding (10%): -5.000 XOF | Net: {balance} XOF</p>
        <button style={{marginTop:'10px', padding:'10px 15px', borderRadius:'8px', border:'none'}}>Retirer via Wave / Orange Money / Visa</button>
      </div>

      <h3 style={{marginTop:'30px'}}>🚀 NovaBoost - Boostez vos produits</h3>
      <p style={{fontSize:'14px', color:'#666'}}>Chaque vendeur peut booster depuis ici. Pas l'admin. Vous.</p>
      <div style={{display:'flex', gap:'10px', marginTop:'10px', flexWrap:'wrap'}}>
        <button onClick={()=>boost(1000)} style={{flex:1, padding:'15px', borderRadius:'10px', border:'1px solid black', background:'white'}}>Boost 1.000 XOF<br/><span style={{fontSize:'12px'}}>24h en Top</span></button>
        <button onClick={()=>boost(5000)} style={{flex:1, padding:'15px', borderRadius:'10px', background:'black', color:'white'}}>Boost 5.000 XOF<br/><span style={{fontSize:'12px'}}>72h + Push notif</span></button>
        <button onClick={()=>boost(10000)} style={{flex:1, padding:'15px', borderRadius:'10px', border:'1px solid black', background:'white'}}>Boost 10.000 XOF<br/><span style={{fontSize:'12px'}}>7 jours + Accueil</span></button>
      </div>

      <div style={{marginTop:'30px', background:'#f5f5f5', padding:'15px', borderRadius:'10px', fontSize:'13px'}}>
        🔒 Sécurité: Paiement Carte prépayée Djamo / UBA + Visa + Mobile Money. Escrow 24h. Lien de téléchargement unique qui expire après 3 téléchargements. Boutique Vérifiée ✅
      </div>
    </div>
  )
}
