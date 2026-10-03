import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
export default function Home(){
  const [products,setProducts]=useState([])
  useEffect(()=>{ 
    const load=async()=>{
      const {data}=await supabase.from('products').select('*').limit(20)
      if(data) setProducts(data)
    }
    load()
  },[])
  return(
    <div style={{fontFamily:'sans-serif', padding:'20px', maxWidth:'900px', margin:'0 auto'}}>
      <h1 style={{fontSize:'36px', marginBottom:'5px'}}>🚀 NovaMinding</h1>
      <p style={{color:'#555'}}>Plateforme africaine • Paiement Wave, Orange Money, Carte Djamo/Visa • XOF & USD • 10% commission</p>
      
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'20px'}}>
        <div style={{background:'#f6f6f6', padding:'12px', borderRadius:'10px', fontSize:'14px'}}>🔒 NovaEscrow 24h - argent bloqué jusqu'à livraison</div>
        <div style={{background:'#f6f6f6', padding:'12px', borderRadius:'10px', fontSize:'14px'}}>🚀 NovaBoost - chaque vendeur booste en 1 clic</div>
      </div>

      <h3 style={{marginTop:'30px'}}>Produits récents {products.length===0?'(aucun - ajoute-en un)':''}</h3>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
        {products.map(p=>(
          <div key={p.id} style={{border:'1px solid #ddd', padding:'15px', borderRadius:'10px'}}>
            <b>{p.title}</b><br/>
            <span>{p.price_xof} XOF</span><br/>
            <span style={{fontSize:'12px', color:'green'}}>✅ Vérifié NovaGuard</span>
          </div>
        ))}
      </div>

      <div style={{marginTop:'30px', display:'flex', gap:'10px'}}>
        <a href="/create-store" style={{background:'black', color:'white', padding:'12px 20px', borderRadius:'8px', textDecoration:'none'}}>Créer ma boutique</a>
        <a href="/create-product" style={{border:'1px solid black', padding:'12px 20px', borderRadius:'8px', textDecoration:'none', color:'black'}}>Vendre un produit</a>
      </div>
    </div>
  )
}
