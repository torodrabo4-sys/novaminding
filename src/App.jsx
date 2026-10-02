import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import CreateStore from './pages/CreateStore'
import CreateProduct from './pages/CreateProduct'
function App(){
  const [user,setUser]=useState(null)
  const [step,setStep]=useState('store')
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{ setUser(data.session?.user) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session)=>{
      setUser(session?.user)
    })
    return ()=> subscription.unsubscribe()
  },[])
  if(!user) return <Auth />
  return (
    <div>
      <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'20px'}}>
        <button onClick={()=>setStep('store')} style={{padding:'8px 12px', borderRadius:'20px', border:'1px solid black', background:step==='store'?'black':'white', color:step==='store'?'white':'black'}}>Boutique</button>
        <button onClick={()=>setStep('product')} style={{padding:'8px 12px', borderRadius:'20px', border:'1px solid black', background:step==='product'?'black':'white', color:step==='product'?'white':'black'}}>Produit</button>
      </div>
      {step==='store'? <CreateStore /> : <CreateProduct />}
    </div>
  )
}
export default App
