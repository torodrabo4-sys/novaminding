import { useState } from 'react'
import { supabase } from '../lib/supabase'
export default function CreateStore(){
  const [name,setName]=useState('')
  const [slug,setSlug]=useState('')
  const create=async()=>{
    const {data:{user}}=await supabase.auth.getUser()
    const {error}=await supabase.from('stores').insert({name, slug, owner_id:user.id})
    if(error) alert(error.message)
    else alert('Boutique créée!')
  }
  return(
    <div style={{maxWidth:'400px', margin:'40px auto', padding:'20px'}}>
      <h2>Créer ta boutique</h2>
      <input style={{width:'100%', padding:'12px', margin:'8px 0'}} placeholder="Nom boutique ex: Test Mali" value={name} onChange={e=>setName(e.target.value)} />
      <input style={{width:'100%', padding:'12px', margin:'8px 0'}} placeholder="Slug ex: test-mali" value={slug} onChange={e=>setSlug(e.target.value)} />
      <button onClick={create} style={{width:'100%', padding:'12px', background:'black', color:'white'}}>Créer</button>
    </div>
  )
}
