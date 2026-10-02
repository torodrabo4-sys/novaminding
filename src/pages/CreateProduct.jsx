import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
export default function CreateProduct(){
  const [stores,setStores]=useState([])
  const [storeId,setStoreId]=useState('')
  const [title,setTitle]=useState('')
  const [price,setPrice]=useState('')
  useEffect(()=>{ (async()=>{ const {data:{user}}=await supabase.auth.getUser(); if(!user) return; const {data}=await supabase.from('stores').select('*').eq('owner_id',user.id); setStores(data||[]); if(data?.[0]) setStoreId(data[0].id) })() },[])
  const create=async()=>{
    if(!storeId) return alert('Crée une boutique dabord')
    const {error}=await supabase.from('products').insert({store_id:storeId, title, description:title, price_xof:parseInt(price)||0, currency:'XOF', status:'pending'})
    if(error) alert(error.message)
    else alert('Produit envoyé à NovaGuard! En attente de vérification.')
  }
  return(
    <div style={{maxWidth:'400px', margin:'40px auto', padding:'20px'}}>
      <h2>Ajouter un produit</h2>
      <p style={{fontSize:'12px', color:'gray'}}>NovaGuard: Titre = Fichier réel | Escrow 24h | Commission 10%</p>
      <select style={{width:'100%', padding:'12px', margin:'8px 0'}} value={storeId} onChange={e=>setStoreId(e.target.value)}>{stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <input style={{width:'100%', padding:'12px', margin:'8px 0'}} placeholder="Titre ex: Formation Video" value={title} onChange={e=>setTitle(e.target.value)} />
      <input style={{width:'100%', padding:'12px', margin:'8px 0'}} placeholder="Prix XOF ex: 5000" type="number" value={price} onChange={e=>setPrice(e.target.value)} />
      <button onClick={create} style={{width:'100%', padding:'12px', background:'black', color:'white', border:'none'}}>Envoyer à NovaGuard</button>
    </div>
  )
}
