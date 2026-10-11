import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export default function App(){
  const [session,setSession]=useState(null)
  const [user,setUser]=useState(null)
  const [profile,setProfile]=useState(null)
  const [authMode,setAuthMode]=useState('login')
  const [authForm,setAuthForm]=useState({nom:'',prenom:'',age:'',day:'15',month:'06',year:'1998',country:'Mali',phone:'',aptitude:'debutante',email:'',password:'',confirmPassword:''})
  const [authLoading,setAuthLoading]=useState(false)
  const [authMsg,setAuthMsg]=useState(null)

  const [tab,setTab]=useState('accueil')
  const [stores,setStores]=useState([])
  const [products,setProducts]=useState([])
  const [orders,setOrders]=useState([])
  const [announcements,setAnnouncements]=useState([])
  const [reviews,setReviews]=useState([])
  const [wallet,setWallet]=useState({balance:0,total:0,commission:0,pending:0})
  const [selectedBoutique,setSelectedBoutique]=useState(null)
  const [showBoutiqueForm,setShowBoutiqueForm]=useState(false)
  const [showProductForm,setShowProductForm]=useState(false)
  const [editingProduct,setEditingProduct]=useState(null)
  const [toast,setToast]=useState(null)
  const [selectedImgId,setSelectedImgId]=useState(null)
  const [showMenuDrawer,setShowMenuDrawer]=useState(false)
  const [faqs,setFaqs]=useState([{q:'',a:''}])
  const [coverPhoto,setCoverPhoto]=useState('')
  const [boutiqueForm,setBoutiqueForm]=useState({name:'',description:'',logo:''})
  const [logoPreview,setLogoPreview]=useState('')
  const [productForm,setProductForm]=useState({title:'',price:'',promoPrice:'',thumbnail:'',fileName:'',duration:'',isFree:false,isPayant:true,sendEmail:false,hideSales:false,stockLimit:''})
  const [thumbPreview,setThumbPreview]=useState('')
  const [announceForm,setAnnounceForm]=useState({title:'',message:''})
  const [buyerCheckout,setBuyerCheckout]=useState({email:'',phone:'',product:null,show:false})
  const [reviewForm,setReviewForm]=useState({productId:'',rating:5,comment:''})

  const descRef=useRef(null)
  const fileLogoRef=useRef(null)
  const fileThumbRef=useRef(null)
  const fileCoverRef=useRef(null)
  const fileDigitalRef=useRef(null)
  const fileDescImgRef=useRef(null)

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{ if(data.session){ setSession(data.session); setUser(data.session.user) } })
    const {data:listener}=supabase.auth.onAuthStateChange((event,sess)=>{ setSession(sess); setUser(sess?.user||null) })
    return ()=>listener.subscription.unsubscribe()
  },[])

  useEffect(()=>{ if(user) init() },[user])

  function showToast(msg){ setToast({msg}); setTimeout(()=>setToast(null),4000) }

  async function init(){
    if(!user) return
    const {data:prof}=await supabase.from('profiles').select('*').eq('id',user.id).single()
    if(prof) setProfile(prof)
    const {data:sts}=await supabase.from('stores').select('*').eq('owner_id',user.id).order('created_at')
    setStores(sts||[])
    if(sts&&sts.length>0){ setSelectedBoutique(sts[0]); setShowBoutiqueForm(false) } else setShowBoutiqueForm(true)
    const {data:prods}=await supabase.from('products').select('*').eq('owner_id',user.id).order('created_at',{ascending:false})
    setProducts(prods||[])
    const {data:ords}=await supabase.from('orders').select('*').eq('seller_id',user.id).order('created_at',{ascending:false})
    setOrders(ords||[])
    const {data:anns}=await supabase.from('announcements').select('*').eq('is_active',true).order('created_at',{ascending:false}).limit(5)
    setAnnouncements(anns||[])
    const {data:revs}=await supabase.from('reviews').select('*').order('created_at',{ascending:false})
    setReviews(revs||[])

    // Wallet avec systeme 24h
    const now=new Date()
    let totalReleased=0, commission=0, pending=0
    ;(ords||[]).forEach(o=>{
      const releaseAt=o.release_at?new Date(o.release_at):null
      if(!releaseAt || releaseAt<=now){
        if(o.status!=='refunded'){ totalReleased+=(o.amount||0) }
      } else { pending+=(o.amount||0) }
    })
    commission=Math.floor(totalReleased*0.1)
    setWallet({balance:totalReleased-commission,total:totalReleased,commission,pending})
  }

  async function handleRegister(){
    if(!authForm.nom||!authForm.prenom||!authForm.email||!authForm.password){ setAuthMsg('Remplis Nom, Prenom, Email, Mot de passe'); return }
    if(authForm.password!==authForm.confirmPassword){ setAuthMsg('Mots de passe differents'); return }
    setAuthLoading(true)
    const {data,error}=await supabase.auth.signUp({email:authForm.email,password:authForm.password,options:{data:{first_name:authForm.prenom,last_name:authForm.nom}}})
    if(error){ setAuthMsg(error.message); setAuthLoading(false); return }
    if(data.user){
      await supabase.from('profiles').insert({id:data.user.id,first_name:authForm.prenom,last_name:authForm.nom,age:parseInt(authForm.age)||0,aptitude:authForm.aptitude,email:authForm.email,country:authForm.country,phone:authForm.phone,birth_day:parseInt(authForm.day)||15,birth_month:parseInt(authForm.month)||6,birth_year:parseInt(authForm.year)||1998})
    }
    setAuthLoading(false); setAuthMode('verify'); setAuthMsg('Compte cree ! Verifie Gmail '+authForm.email+' - Lien de confirmation envoye. Interface perso active.')
  }
  async function handleLogin(){
    setAuthLoading(true)
    const {data,error}=await supabase.auth.signInWithPassword({email:authForm.email,password:authForm.password})
    if(error){ setAuthMsg(error.message); setAuthLoading(false); return }
    setSession(data.session); setUser(data.user); setAuthLoading(false)
  }
  async function handleLogout(){ await supabase.auth.signOut(); setSession(null); setUser(null); setProfile(null) }

  function handleLogoUpload(e){ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ setLogoPreview(ev.target.result); setBoutiqueForm({...boutiqueForm,logo:ev.target.result}) }; r.readAsDataURL(f) }
  function handleThumbUpload(e){ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ setThumbPreview(ev.target.result); setProductForm({...productForm,thumbnail:ev.target.result}) }; r.readAsDataURL(f) }
  function handleCoverUpload(e){ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ setCoverPhoto(ev.target.result) }; r.readAsDataURL(f) }
  function handleDigitalUpload(e){ const f=e.target.files[0]; if(!f) return; setProductForm({...productForm,fileName:f.name}) }
  function handleDescImageUpload(e){
    const files=Array.from(e.target.files)
    files.forEach(file=>{
      const r=new FileReader()
      r.onload=ev=>{
        const id='img_'+Date.now()+'_'+Math.random().toString(36).substring(2,5)
        const html='<div id="'+id+'" onclick="window.selectImg(\''+id+'\')" style="display:inline-block; margin:8px; border:2px solid #111; border-radius:10px; overflow:hidden; width:160px; background:#fff; cursor:pointer;"><img src="'+ev.target.result+'" style="width:100%; height:110px; object-fit:cover;" /></div>'
        if(descRef.current){ descRef.current.focus(); document.execCommand('insertHTML',false,html) }
      }
      r.readAsDataURL(file)
    })
  }

  useEffect(()=>{ window.selectImg=(id)=>{ setSelectedImgId(id); const el=document.getElementById(id); if(el){ document.querySelectorAll('[id^=img_]').forEach(d=>d.style.border='2px solid #111'); el.style.border='3px solid #ffcc00' } } },[])

  function manipulateSelected(action){
    if(!selectedImgId){ showToast('Clique une photo dans description'); return }
    const el=document.getElementById(selectedImgId); if(!el) return
    const img=el.querySelector('img')
    if(action==='small'){ el.style.width='110px'; if(img) img.style.height='75px'; el.style.float='none'; el.style.display='inline-block' }
    if(action==='medium'){ el.style.width='180px'; if(img) img.style.height='120px'; el.style.float='none'; el.style.display='inline-block' }
    if(action==='large'){ el.style.width='100%'; el.style.maxWidth='360px'; if(img) img.style.height='200px'; el.style.float='none'; el.style.display='block' }
    if(action==='left'){ el.style.float='left'; el.style.margin='8px 12px 8px 0' }
    if(action==='right'){ el.style.float='right'; el.style.margin='8px 0 8px 12px' }
    if(action==='center'){ el.style.float='none'; el.style.display='block'; el.style.margin='12px auto' }
    if(action==='delete'){ el.remove(); setSelectedImgId(null) }
    showToast(action+' applique')
  }

  function execBold(){ const sel=window.getSelection(); if(!sel||sel.toString().length===0){ showToast('Selectionne phrase puis Gras'); return } document.execCommand('bold',false,null) }
  function execH2(){ document.execCommand('formatBlock',false,'<h2>') }
  function aiAssistant(){ if(!descRef.current) return; const cur=descRef.current.innerText; if(!cur.trim()){ showToast('Ecris 10 mots'); return } const imp='<h3 style="font-weight:800;">'+(productForm.title||'Produit')+'</h3><p><b>'+cur.substring(0,120)+'</b></p>'; descRef.current.innerHTML=imp+descRef.current.innerHTML }

  async function createBoutique(){
    if(!user) return
    if(stores.length>=1){ showToast('1 seule boutique'); return }
    if(!boutiqueForm.name){ showToast('Nom requis'); return }
    const {error}=await supabase.from('stores').insert({name:boutiqueForm.name,description:boutiqueForm.description,logo_url:boutiqueForm.logo,owner_id:user.id})
    if(error){ showToast(error.message); return }
    showToast('Boutique creee'); setBoutiqueForm({name:'',description:'',logo:''}); setLogoPreview(''); setShowBoutiqueForm(false); init()
  }

  async function createOrUpdateProduct(){
    if(!user||!selectedBoutique) return
    if(!editingProduct&&products.filter(p=>p.store_id===selectedBoutique.id).length>=30){ showToast('30 max'); return }
    if(!productForm.title){ showToast('Nom requis'); return }
    if(!productForm.isFree&&!productForm.price){ showToast('Prix requis'); return }
    const finalPrice=productForm.isFree?0:parseInt(productForm.price)
    const finalDesc=descRef.current?descRef.current.innerHTML:''
    const extra={coverPhoto,thumbnail:productForm.thumbnail||thumbPreview||coverPhoto,fileName:productForm.fileName,faqs:faqs.filter(f=>f.q&&f.a),duration:productForm.duration,isFree:productForm.isFree,isPayant:productForm.isPayant,sendEmail:productForm.sendEmail,hideSales:productForm.hideSales,promoPrice:productForm.promoPrice,stockLimit:productForm.stockLimit?parseInt(productForm.stockLimit):null}
    const fullDesc=finalDesc+'<!--META:'+JSON.stringify(extra)+'-→'
    const payload={title:productForm.title,price:finalPrice,description:fullDesc,store_id:selectedBoutique.id,owner_id:user.id,is_public:true,stock_limit:extra.stockLimit}
    if(editingProduct){
      const {error}=await supabase.from('products').update(payload).eq('id',editingProduct.id)
      if(error){ showToast(error.message); return }
      showToast('Produit modifie')
    } else {
      const {error}=await supabase.from('products').insert(payload)
      if(error){ showToast(error.message); return }
      showToast('Produit cree - Lien Facebook Ads pret')
    }
    setProductForm({title:'',price:'',promoPrice:'',thumbnail:'',fileName:'',duration:'',isFree:false,isPayant:true,sendEmail:false,hideSales:false,stockLimit:''})
    setThumbPreview(''); setCoverPhoto(''); if(descRef.current) descRef.current.innerHTML=''; setFaqs([{q:'',a:''}]); setShowProductForm(false); setEditingProduct(null); init(); setTab('produits')
  }

  function parseMeta(d){ try{ const m=d.match(/<!--META:(.*?)-→/); if(m) return JSON.parse(m[1]) }catch(e){} return null }
  function getProductThumb(p){ const meta=parseMeta(p.description||''); if(meta&&meta.thumbnail) return meta.thumbnail; if(meta&&meta.coverPhoto) return meta.coverPhoto; const m=(p.description||'').match(/<img[^>]+src="([^"]+)"/); if(m) return m[1]; return null }

  async function createAnnouncement(){
    if(!announceForm.title||!announceForm.message){ showToast('Titre + message requis'); return }
    const {error}=await supabase.from('announcements').insert({title:announceForm.title,message:announceForm.message,created_by:user.id,is_active:true})
    if(error){ showToast(error.message); return }
    showToast('Annonce envoyee a tous comme Orange Money promo'); setAnnounceForm({title:'',message:''}); init()
  }

  async function handleBuyerPurchase(){
    if(!buyerCheckout.product) return
    if(!buyerCheckout.email||!buyerCheckout.phone){ showToast('Email + numero requis'); return }
    const p=buyerCheckout.product
    const releaseAt=new Date(Date.now()+24*60*60*1000).toISOString()
    const {data,error}=await supabase.from('orders').insert({product_id:p.id,seller_id:p.owner_id,buyer_email:buyerCheckout.email,buyer_phone:buyerCheckout.phone,amount:p.price,status:'pending',release_at:releaseAt,buyer_country:'Mali'})
    if(error){ showToast(error.message); return }
    showToast('Achat enregistre - Argent bloque 24h - Apres 24h debloque + email vendeur si coche')
    // Si vendeur a coche Email acheteurs, on log dans Supabase (a remplacer par Edge Function email)
    const meta=parseMeta(p.description||'')
    if(meta?.sendEmail){
      // Ici on pourrait appeler une Edge Function qui envoie email au vendeur
      console.log('Email acheteur a envoyer au vendeur:',buyerCheckout.email)
    }
    setBuyerCheckout({email:'',phone:'',product:null,show:false})
    // Message pour commentaire apres 2 jours
    setTimeout(()=>{ showToast('Il y a 2 jours vous avez achete '+p.title+' - Laissez un commentaire ?') },2000)
  }

  async function submitReview(){
    if(!reviewForm.productId||!reviewForm.comment){ showToast('Produit + commentaire requis'); return }
    const {error}=await supabase.from('reviews').insert({product_id:reviewForm.productId,buyer_id:user?.id,rating:reviewForm.rating,comment:reviewForm.comment,buyer_email:user?.email||'anonyme'})
    if(error){ showToast(error.message); return }
    showToast('Commentaire ajoute - Visible apres achat seulement'); setReviewForm({productId:'',rating:5,comment:''}); init()
  }

  const boutiqueProducts=selectedBoutique?products.filter(p=>p.store_id===selectedBoutique.id):[]

  if(!user){
    return (
      <div style={{maxWidth:480,margin:'0 auto',fontFamily:'Inter,sans-serif',background:'#fafafa',minHeight:'100vh',color:'#111'}}>
        <div style={{background:'#111',padding:'18px',color:'#fff',textAlign:'center',borderBottom:'4px solid #ffcc00'}}>
          <div style={{fontWeight:'800',fontSize:20}}>novaminding</div>
          <div style={{fontSize:11,color:'#ffcc00',marginTop:4}}>PLATEFORME VENTE - INTERFACE PERSO</div>
        </div>
        <div style={{padding:20}}>
          {authMode==='verify' ? (
            <div style={{background:'#fff',borderRadius:18,padding:20,border:'1px solid #eee',textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:'800'}}>📧 Verifie ton Gmail</div>
              <div style={{fontSize:13,color:'#666',marginTop:12}}>Email envoye a <b>{authForm.email}</b><br/>Clique lien confirmation. Code de verification envoye. Apres, connecte-toi avec ton mot de passe perso.</div>
              <button onClick={()=>setAuthMode('login')} style={{width:'100%',marginTop:16,padding:14,borderRadius:12,border:'none',background:'#111',color:'#ffcc00',fontWeight:'800'}}>J ai confirme - Me connecter</button>
            </div>
          ) : (
            <div style={{background:'#fff',borderRadius:18,padding:18,border:'1px solid #eee'}}>
              <div style={{display:'flex',gap:8,marginBottom:16}}>
                <button onClick={()=>setAuthMode('login')} style={{flex:1,padding:'10px',borderRadius:20,border:'none',background:authMode==='login'?'#111':'#f5f5f5',color:authMode==='login'?'#ffcc00':'#111',fontWeight:'700',fontSize:12}}>Connexion</button>
                <button onClick={()=>setAuthMode('register')} style={{flex:1,padding:'10px',borderRadius:20,border:'none',background:authMode==='register'?'#111':'#f5f5f5',color:authMode==='register'?'#ffcc00':'#111',fontWeight:'700',fontSize:12}}>Inscription</button>
              </div>
              {authMode==='register' ? (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    <input value={authForm.nom} onChange={e=>setAuthForm({...authForm,nom:e.target.value})} placeholder="Nom *" style={{padding:12,borderRadius:10,border:'2px solid #111',fontSize:12}}/>
                    <input value={authForm.prenom} onChange={e=>setAuthForm({...authForm,prenom:e.target.value})} placeholder="Prenom *" style={{padding:12,borderRadius:10,border:'2px solid #111',fontSize:12}}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    <input value={authForm.age} onChange={e=>setAuthForm({...authForm,age:e.target.value})} placeholder="Age *" type="number" style={{padding:12,borderRadius:10,border:'1px solid #ddd',fontSize:12}}/>
                    <input value={authForm.day} onChange={e=>setAuthForm({...authForm,day:e.target.value})} placeholder="J" style={{padding:12,borderRadius:10,border:'1px solid #ddd',fontSize:12}}/>
                    <input value={authForm.month} onChange={e=>setAuthForm({...authForm,month:e.target.value})} placeholder="M" style={{padding:12,borderRadius:10,border:'1px solid #ddd',fontSize:12}}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    <input value={authForm.year} onChange={e=>setAuthForm({...authForm,year:e.target.value})} placeholder="Année" style={{padding:12,borderRadius:10,border:'1px solid #ddd',fontSize:12}}/>
                    <select value={authForm.country} onChange={e=>setAuthForm({...authForm,country:e.target.value})} style={{padding:12,borderRadius:10,border:'2px solid #111',fontSize:12,background:'#fff'}}>
                      <option>Mali</option><option>Sénégal</option><option>Côte d'Ivoire</option><option>Burkina Faso</option><option>Guinée</option><option>Niger</option><option>Togo</option><option>Bénin</option><option>Cameroun</option><option>Congo</option><option>RDC</option><option>Gabon</option><option>Tchad</option><option>Mauritanie</option><option>Maroc</option><option>Algérie</option><option>Tunisie</option><option>France</option><option>Belgique</option><option>Canada</option><option>USA</option><option>Allemagne</option><option>Espagne</option><option>Italie</option><option>Royaume-Uni</option><option>Brésil</option><option>Inde</option><option>Chine</option><option>Dubai - UAE</option><option>Autre</option>
                    </select>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    <input value={authForm.phone} onChange={e=>setAuthForm({...authForm,phone:e.target.value})} placeholder="Tel +223..." style={{padding:12,borderRadius:10,border:'2px solid #111',fontSize:12}}/>
                    <select value={authForm.aptitude} onChange={e=>setAuthForm({...authForm,aptitude:e.target.value})} style={{padding:12,borderRadius:10,border:'1px solid #ddd',fontSize:12}}>
                      <option value="debutante">Debutante</option>
                      <option value="moyenne">Moyenne</option>
                    </select>
                  </div>
                  <div style={{display:'flex',gap:8,marginBottom:10}}>
                    <label style={{flex:1,display:'flex',gap:6,padding:'10px',background:authForm.aptitude==='debutante'?'#ffcc00':'#fff',borderRadius:10,border:'1px solid #111',fontSize:12}}><input type="checkbox" checked={authForm.aptitude==='debutante'} onChange={()=>setAuthForm({...authForm,aptitude:'debutante'})}/> Debutante</label>
                    <label style={{flex:1,display:'flex',gap:6,padding:'10px',background:authForm.aptitude==='moyenne'?'#111':'#fff',color:authForm.aptitude==='moyenne'?'#ffcc00':'#111',borderRadius:10,border:'1px solid #111',fontSize:12}}><input type="checkbox" checked={authForm.aptitude==='moyenne'} onChange={()=>setAuthForm({...authForm,aptitude:'moyenne'})}/> Moyenne</label>
                  </div>
                  <input value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="Email Gmail *" style={{width:'100%',padding:12,borderRadius:10,border:'2px solid #111',fontSize:12,marginBottom:10}}/>
                  <input value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder="Mot de passe perso *" type="password" style={{width:'100%',padding:12,borderRadius:10,border:'1px solid #ddd',fontSize:12,marginBottom:10}}/>
                  <input value={authForm.confirmPassword} onChange={e=>setAuthForm({...authForm,confirmPassword:e.target.value})} placeholder="Confirme mot de passe *" type="password" style={{width:'100%',padding:12,borderRadius:10,border:'1px solid #ddd',fontSize:12,marginBottom:12}}/>
                </>
              ) : (
                <>
                  <input value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="Email Gmail" style={{width:'100%',padding:12,borderRadius:10,border:'2px solid #111',fontSize:12,marginBottom:10}}/>
                  <input value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder="Mot de passe perso" type="password" style={{width:'100%',padding:12,borderRadius:10,border:'1px solid #ddd',fontSize:12,marginBottom:12}}/>
                </>
              )}
              {authMsg && <div style={{padding:10,background:'#111',color:'#fff',borderRadius:10,fontSize:11,marginBottom:12}}>{authMsg}</div>}
              {authMode==='register' ? <button onClick={handleRegister} disabled={authLoading} style={{width:'100%',padding:14,borderRadius:12,border:'none',background:'#ffcc00',color:'#111',fontWeight:'800'}}>{authLoading?'Creation...':'Creer compte + Code Gmail'}</button> : <button onClick={handleLogin} disabled={authLoading} style={{width:'100%',padding:14,borderRadius:12,border:'none',background:'#111',color:'#ffcc00',fontWeight:'800'}}>{authLoading?'Connexion...':'Se connecter'}</button>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{maxWidth:480,margin:'0 auto',fontFamily:'Inter,sans-serif',background:'#fafafa',minHeight:'100vh',color:'#111',paddingBottom:100}}>
      {toast && <div style={{position:'fixed',top:12,left:12,right:12,zIndex:100,background:'#111',color:'#fff',padding:'12px',borderRadius:12,fontSize:12,borderLeft:'4px solid #ffcc00'}}>{toast.msg}</div>}
      <div style={{background:'#fff',padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:20,borderBottom:'1px solid #eee'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button onClick={()=>setShowMenuDrawer(true)} style={{width:36,height:36,borderRadius:18,background:'#f5f5f5',border:'none'}}>☰</button>
          <div style={{fontWeight:'800',fontSize:15}}>novaminding</div>
          <div style={{fontSize:9,background:'#111',color:'#ffcc00',padding:'3px 7px',borderRadius:20,fontWeight:'800'}}>V22 FINAL</div>
        </div>
        <button onClick={handleLogout} style={{width:32,height:32,borderRadius:16,background:'#111',color:'#fff',border:'none'}}>D</button>
      </div>

      {showMenuDrawer && (
        <div style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.5)'}} onClick={()=>setShowMenuDrawer(false)}>
          <div style={{width:'80%',maxWidth:300,height:'100vh',background:'#fff',padding:20,boxShadow:'4px 0 20px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontWeight:'800',fontSize:16}}>Menu</div>
              <button onClick={()=>setShowMenuDrawer(false)} style={{width:32,height:32,borderRadius:16,border:'none',background:'#f5f5f5'}}>✕</button>
            </div>
            
            <div style={{background:'#111',borderRadius:14,padding:14,color:'#fff',marginBottom:16,borderLeft:'4px solid #ffcc00'}}>
              <div style={{fontWeight:'800',fontSize:14}}>{profile?.first_name} {profile?.last_name}</div>
              <div style={{fontSize:11,color:'#ffcc00',marginTop:4}}>{profile?.email}</div>
              <div style={{fontSize:11,color:'#aaa',marginTop:6}}>Age: {profile?.age} - {profile?.aptitude}</div>
              <div style={{fontSize:10,color:'#888',marginTop:4}}>ID: {user?.id?.slice(0,8)}...</div>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button onClick={()=>{setTab('accueil'); setShowMenuDrawer(false)}} style={{padding:14,borderRadius:12,border:'1px solid #eee',background:tab==='accueil'?'#ffcc00':'#fff',textAlign:'left',fontWeight:'700'}}>🏠 Accueil</button>
              <button onClick={()=>{setTab('produits'); setShowMenuDrawer(false)}} style={{padding:14,borderRadius:12,border:'1px solid #eee',background:tab==='produits'?'#ffcc00':'#fff',textAlign:'left',fontWeight:'700'}}>📦 Mes Produits</button>
              <button onClick={()=>{setTab('ventes'); setShowMenuDrawer(false)}} style={{padding:14,borderRadius:12,border:'1px solid #eee',background:tab==='ventes'?'#ffcc00':'#fff',textAlign:'left',fontWeight:'700'}}>💰 Ventes / Wallet</button>
              <button onClick={()=>{setTab('statistiques'); setShowMenuDrawer(false)}} style={{padding:14,borderRadius:12,border:'1px solid #eee',background:tab==='statistiques'?'#ffcc00':'#fff',textAlign:'left',fontWeight:'700'}}>📊 Stats - Pays + Email</button>
              <button onClick={()=>{setTab('admin'); setShowMenuDrawer(false)}} style={{padding:14,borderRadius:12,border:'1px solid #111',background:'#111',color:'#ffcc00',textAlign:'left',fontWeight:'700'}}>👑 Admin - Annonces</button>
              
              <div style={{height:1,background:'#eee',margin:'12px 0'}}></div>
              
              <div style={{padding:10,background:'#fafafa',borderRadius:10}}>
                <div style={{fontSize:11,fontWeight:'700',marginBottom:6}}>📍 Tes infos dans Supabase:</div>
                <div style={{fontSize:10,color:'#666',lineHeight:'1.6'}}>
                  Table <b>profiles</b> → {profile?.first_name} {profile?.last_name}<br/>
                  Table <b>stores</b> → {stores.length} boutique(s)<br/>
                  Table <b>products</b> → {products.length} produit(s)<br/>
                  Table <b>orders</b> → {orders.length} commande(s)
                </div>
              </div>

              <button onClick={()=>{handleLogout(); setShowMenuDrawer(false)}} style={{padding:14,borderRadius:12,border:'1px solid #ff4444',background:'#fff',color:'#ff4444',textAlign:'left',fontWeight:'700',marginTop:8}}>🚪 Déconnexion</button>
            </div>
          </div>
        </div>
      )}



      {announcements.length>0 && (
        <div style={{margin:12,background:'#ffcc00',borderRadius:14,padding:12,border:'2px solid #111'}}>
          <div style={{fontSize:11,fontWeight:'800'}}>📢 ANNONCE ADMIN - Comme Orange Money promo</div>
          {announcements.map(a=><div key={a.id} style={{marginTop:8,background:'#111',color:'#fff',padding:10,borderRadius:10}}><div style={{fontWeight:'700',fontSize:12,color:'#ffcc00'}}>{a.title}</div><div style={{fontSize:11,marginTop:4}}>{a.message}</div></div>)}
        </div>
      )}

      <div style={{padding:14}}>
        {tab==='accueil' && (
          <>
            <div style={{background:'#111',borderRadius:18,padding:18,color:'#fff',borderLeft:'5px solid #ffcc00',marginBottom:14}}>
              <div style={{fontSize:12,color:'#ffcc00',fontWeight:'800'}}>📌 NOTRE VISION</div>
              <div style={{fontSize:14,marginTop:10,lineHeight:'1.6'}}>NovaMinding permet a chacun de vendre en ligne meme de zero. Avec IA, creez et gerez votre boutique depuis chez vous.</div>
            </div>
            <div style={{fontSize:24,fontWeight:'800'}}>Bonjour {profile?.first_name||'Didier'} 👋</div>
            <div style={{fontSize:12,color:'#666',marginTop:4}}>Boutique {boutiqueProducts.length}/30 - {profile?.aptitude} - Perso</div>
            <div style={{display:'flex',gap:8,margin:'14px 0'}}>
              <button onClick={()=>setTab('produits')} style={{flex:1,background:'#ffcc00',color:'#111',border:'none',borderRadius:24,padding:13,fontWeight:'800',fontSize:13}}>➕ Nouveau produit</button>
              <button onClick={()=>setTab('produits')} style={{padding:'13px 16px',borderRadius:24,border:'1px solid #111',background:'#fff',fontWeight:'700',fontSize:13}}>📦 Mes produits</button>
            </div>
            <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #eee'}}>
              <div style={{fontSize:11,color:'#888'}}>💳 WALLET SOLDE (apres 24h + 10% commission)</div>
              <div style={{fontSize:32,fontWeight:'800',marginTop:6}}>{wallet.balance} FCFA</div>
              <div style={{fontSize:11,color:'#666',marginTop:6}}>Total {wallet.total} - Commission {wallet.commission} - En attente 24h: {wallet.pending} FCFA</div>
              <div style={{fontSize:10,background:'#fafafa',padding:10,borderRadius:10,marginTop:10}}>Argent bloque 24h si pas plainte → debloque + 10% enleve → retirable a tout moment</div>
            </div>
          </>
        )}

        {tab==='produits' && (
          <div style={{background:'#fff',borderRadius:16,padding:14,border:'1px solid #eee'}}>
            {!showBoutiqueForm && !showProductForm ? (
              <>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><div style={{fontWeight:'700',fontSize:13}}>📦 Produits {boutiqueProducts.length}/30 - Interface perso intacte</div><button onClick={()=>setShowProductForm(true)} style={{padding:'8px 14px',borderRadius:20,border:'none',background:'#111',color:'#ffcc00',fontWeight:'700',fontSize:11}}>+ Produit</button></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {boutiqueProducts.map(p=>{
                    const meta=parseMeta(p.description||''); const thumb=getProductThumb(p)
                    return <div key={p.id} style={{background:'#fff',borderRadius:12,border:'1px solid #eee',overflow:'hidden'}}>{thumb ? <img src={thumb} style={{width:'100%',height:110,objectFit:'cover'}}/> : <div style={{height:110,background:'#fafafa',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>Pas miniature</div>}<div style={{padding:8}}><div style={{fontWeight:'600',fontSize:11}}>{p.title}</div><div style={{fontSize:11,fontWeight:'800',marginTop:2}}>{meta?.isFree?'Gratuit':p.price+' FCFA'} {meta?.stockLimit?'- Stock:'+meta.stockLimit:''}</div><div style={{display:'flex',gap:4,marginTop:6}}><button onClick={()=>{const l=window.location.origin+window.location.pathname+'#/p/'+p.id; navigator.clipboard.writeText(l); showToast('Lien Facebook Ads copie - Pret pour pub')}} style={{flex:1,padding:'5px',borderRadius:6,background:'#ffcc00',border:'none',fontSize:9}}>Lien FB Ads</button><button onClick={()=>setBuyerCheckout({email:'',phone:'',product:p,show:true})} style={{flex:1,padding:'5px',borderRadius:6,background:'#111',color:'#ffcc00',border:'none',fontSize:9}}>Test Achat</button></div></div></div>
                  })}
                </div>
                {buyerCheckout.show && (
                  <div style={{marginTop:16,padding:14,background:'#111',borderRadius:14,color:'#fff'}}>
                    <div style={{fontWeight:'700',fontSize:12,color:'#ffcc00'}}>🛒 Acheteur - Connexion email + numero + carte - Comme tu veux</div>
                    <div style={{fontSize:11,color:'#aaa',marginTop:6}}>Lien copie → arrive direct produit → couverture + nom + description → clique Acheter → email + numero + carte</div>
                    <input value={buyerCheckout.email} onChange={e=>setBuyerCheckout({...buyerCheckout,email:e.target.value})} placeholder="Email acheteur *" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ffcc00',marginTop:10,fontSize:12}}/>
                    <input value={buyerCheckout.phone} onChange={e=>setBuyerCheckout({...buyerCheckout,phone:e.target.value})} placeholder="Numero Orange Money / Carte *" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ddd',marginTop:8,fontSize:12}}/>
                    <div style={{display:'flex',gap:8,marginTop:10}}><button onClick={handleBuyerPurchase} style={{flex:1,padding:10,borderRadius:8,background:'#ffcc00',border:'none',fontWeight:'800',fontSize:11}}>Payer - Bloque 24h</button><button onClick={()=>setBuyerCheckout({email:'',phone:'',product:null,show:false})} style={{padding:10,borderRadius:8,background:'#333',color:'#fff',border:'none',fontSize:11}}>Annuler</button></div>
                    <div style={{fontSize:10,color:'#aaa',marginTop:8}}>Si vendeur a coche Email acheteurs, il recoit Gmail avec email acheteur + message</div>
                  </div>
                )}
              </>
            ) : showBoutiqueForm ? (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><div style={{fontWeight:'700'}}>🏪 Creer boutique unique</div><button onClick={()=>setShowBoutiqueForm(false)} style={{border:'none',background:'#f5f5f5',borderRadius:20,padding:'6px 12px',fontSize:12}}>Retour</button></div>
                <input value={boutiqueForm.name} onChange={e=>setBoutiqueForm({...boutiqueForm,name:e.target.value})} placeholder="Nom boutique" style={{width:'100%',padding:12,borderRadius:10,border:'2px solid #111',marginBottom:10}}/>
                <button onClick={createBoutique} style={{width:'100%',padding:13,borderRadius:10,border:'none',background:'#ffcc00',color:'#111',fontWeight:'800'}}>✅ Creer boutique</button>
              </div>
            ) : (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><div style={{fontWeight:'700',fontSize:13}}>➕ Nouveau - Fixe a vie + Stock limit + Photos repares</div><button onClick={()=>{setShowProductForm(false); setEditingProduct(null)}} style={{border:'none',background:'#f5f5f5',borderRadius:20,padding:'6px 12px',fontSize:12}}>Retour</button></div>
                <div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:'700',marginBottom:6}}>1️⃣ NOM PRODUIT *</div><input value={productForm.title} onChange={e=>setProductForm({...productForm,title:e.target.value})} placeholder="Titre" style={{width:'100%',padding:12,borderRadius:10,border:'2px solid #111'}}/></div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:'700',marginBottom:6}}>2️⃣ PRIX + STOCK LIMIT *</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                    <input value={productForm.price} onChange={e=>setProductForm({...productForm,price:e.target.value})} placeholder="Prix FCFA" type="number" style={{padding:12,borderRadius:10,border:'2px solid #111'}} disabled={productForm.isFree}/>
                    <input value={productForm.promoPrice} onChange={e=>setProductForm({...productForm,promoPrice:e.target.value})} placeholder="Promo" type="number" style={{padding:12,borderRadius:10,border:'1px solid #ddd'}}/>
                    <input value={productForm.stockLimit} onChange={e=>setProductForm({...productForm,stockLimit:e.target.value})} placeholder="Limite vente (ex: 100)" type="number" style={{padding:12,borderRadius:10,border:'1px solid #ffcc00',background:'#fff8cc'}}/>
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:10}}>
                    <label style={{flex:1,display:'flex',alignItems:'center',gap:6,padding:'10px',background:productForm.isFree?'#ffcc00':'#fff',borderRadius:10,border:'1px solid #111',fontSize:12}}><input type="checkbox" checked={productForm.isFree} onChange={e=>setProductForm({...productForm,isFree:e.target.checked,isPayant:!e.target.checked})}/> 🆓 Gratuit</label>
                    <label style={{flex:1,display:'flex',alignItems:'center',gap:6,padding:'10px',background:productForm.isPayant?'#111':'#fff',color:productForm.isPayant?'#ffcc00':'#111',borderRadius:10,border:'1px solid #111',fontSize:12}}><input type="checkbox" checked={productForm.isPayant} onChange={e=>setProductForm({...productForm,isPayant:e.target.checked,isFree:!e.target.checked})}/> 💰 Payant</label>
                  </div>
                </div>
                <div style={{background:'#111',color:'#fff',padding:10,borderRadius:10,marginBottom:8}}><div style={{fontSize:11,fontWeight:'700',color:'#ffcc00'}}>3️⃣ DESCRIPTION & PHOTOS - FIXE A VIE - REPARE</div><div style={{fontSize:10,color:'#aaa',marginTop:4}}>Clique photo → Petite/Moyenne/Grande + Gauche/Droite/Centre → Fonctionnel comme avant</div></div>
                <div style={{marginBottom:12,border:'2px solid #111',borderRadius:12,overflow:'hidden'}}>
                  <div style={{display:'flex',gap:4,padding:8,background:'#111',flexWrap:'wrap'}}>
                    <button onClick={execBold} style={{padding:'6px 12px',borderRadius:20,border:'none',background:'#ffcc00',fontSize:11,fontWeight:'700'}}>Gras selection</button>
                    <button onClick={execH2} style={{padding:'6px 10px',borderRadius:20,background:'#fff',border:'none',fontSize:11}}>Titre</button>
                    <input ref={fileDescImgRef} type="file" accept="image/*" multiple onChange={handleDescImageUpload} style={{display:'none'}}/>
                    <button onClick={()=>fileDescImgRef.current.click()} style={{padding:'6px 10px',borderRadius:20,background:'#fff',border:'none',fontSize:11}}>📸 Photos</button>
                    <button onClick={aiAssistant} style={{marginLeft:'auto',padding:'6px 12px',borderRadius:20,border:'none',background:'#ffcc00',fontSize:10,fontWeight:'800'}}>🤖 IA</button>
                  </div>
                  <div ref={descRef} contentEditable style={{minHeight:180,padding:12,fontSize:13,outline:'none',background:'#fff'}}></div>
                </div>
                {selectedImgId && (
                  <div style={{marginBottom:12,background:'#fff8cc',borderRadius:10,padding:10,border:'2px solid #ffcc00'}}>
                    <div style={{fontSize:11,fontWeight:'700',marginBottom:8}}>📸 Photo selectionnee - Position REPAREE</div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      <button onClick={()=>manipulateSelected('small')} style={{padding:'6px 10px',borderRadius:20,background:'#fff',border:'1px solid #ddd',fontSize:11}}>Petite</button>
                      <button onClick={()=>manipulateSelected('medium')} style={{padding:'6px 10px',borderRadius:20,background:'#fff',border:'1px solid #ddd',fontSize:11}}>Moyenne</button>
                      <button onClick={()=>manipulateSelected('large')} style={{padding:'6px 10px',borderRadius:20,background:'#ffcc00',border:'none',fontSize:11}}>Grande</button>
                      <button onClick={()=>manipulateSelected('left')} style={{padding:'6px 10px',borderRadius:20,background:'#111',color:'#ffcc00',border:'none',fontSize:11}}>⬅️ Gauche</button>
                      <button onClick={()=>manipulateSelected('right')} style={{padding:'6px 10px',borderRadius:20,background:'#111',color:'#ffcc00',border:'none',fontSize:11}}>Droite ➡️</button>
                      <button onClick={()=>manipulateSelected('center')} style={{padding:'6px 10px',borderRadius:20,background:'#fff',border:'1px solid #111',fontSize:11}}>Centre</button>
                      <button onClick={()=>manipulateSelected('delete')} style={{padding:'6px 10px',borderRadius:20,background:'#ff4444',color:'#fff',border:'none',fontSize:11}}>Suppr</button>
                    </div>
                  </div>
                )}
                <div style={{background:'#111',color:'#fff',padding:10,borderRadius:10,marginBottom:8,borderLeft:'4px solid #ffcc00'}}><div style={{fontSize:11,fontWeight:'800',color:'#ffcc00'}}>4️⃣ COUVERTURE - 1200x600 - 1 SEULE</div></div>
                <input ref={fileCoverRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{display:'none'}}/>
                <button onClick={()=>fileCoverRef.current.click()} style={{width:'100%',padding:13,borderRadius:10,border:'2px dashed #111',background:'#fff8cc',fontSize:12,fontWeight:'700',marginBottom:8}}>📸 Ajouter couverture - 1200x600</button>
                {coverPhoto && <img src={coverPhoto} style={{width:'100%',height:140,borderRadius:12,objectFit:'cover',border:'2px solid #ffcc00',marginBottom:12}}/>}
                <div style={{background:'#111',color:'#fff',padding:10,borderRadius:10,marginBottom:8,borderLeft:'4px solid #ffcc00'}}><div style={{fontSize:11,fontWeight:'800',color:'#ffcc00'}}>5️⃣ MINIATURE - 800x800</div></div>
                <input ref={fileThumbRef} type="file" accept="image/*" onChange={handleThumbUpload} style={{display:'none'}}/>
                <button onClick={()=>fileThumbRef.current.click()} style={{width:'100%',padding:13,borderRadius:10,border:'2px dashed #111',background:'#fff',fontSize:12,fontWeight:'700',marginBottom:8}}>📱 Miniature - 800x800</button>
                {thumbPreview && <img src={thumbPreview} style={{width:'100%',height:130,borderRadius:12,objectFit:'cover',border:'2px solid #ffcc00',marginBottom:12}}/>}
                <button onClick={createOrUpdateProduct} style={{width:'100%',padding:15,borderRadius:12,border:'none',background:'#111',color:'#ffcc00',fontWeight:'800',fontSize:13}}>Creer - Lien Facebook Ads pret</button>
              </div>
            )}
          </div>
        )}

        {tab==='ventes' && (
          <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #eee'}}>
            <div style={{background:'#111',borderRadius:14,padding:14,color:'#fff',borderLeft:'5px solid #ffcc00',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:'800',color:'#ffcc00'}}>💰 VENTES - 24H BLOQUE + 10% APRES</div>
              <div style={{fontSize:11,color:'#ccc',marginTop:8}}>Argent bloque 24h si pas plainte → debloque → 10% enleve → retirable</div>
            </div>
            <div style={{background:'#111',color:'#fff',padding:18,borderRadius:14,marginBottom:12}}>
              <div style={{fontSize:11,color:'#888'}}>💳 SOLDE DISPO</div>
              <div style={{fontSize:32,fontWeight:'800',color:'#ffcc00'}}>{wallet.balance} FCFA</div>
              <div style={{fontSize:11,color:'#aaa',marginTop:6}}>Total {wallet.total} - Comm {wallet.commission} - Attente 24h: {wallet.pending}</div>
            </div>
            <div style={{marginTop:12}}>
              {orders.slice(0,10).map(o=><div key={o.id} style={{padding:10,background:'#fafafa',borderRadius:10,marginBottom:8,border:'1px solid #eee'}}><div style={{fontSize:11,fontWeight:'700'}}>{o.buyer_email} - {o.amount} FCFA - {o.status}</div><div style={{fontSize:10,color:'#888'}}>{o.buyer_phone} - {o.buyer_country} - {o.release_at?new Date(o.release_at).toLocaleDateString():''}</div></div>)}
            </div>
          </div>
        )}

        {tab==='statistiques' && (
          <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #eee'}}>
            <div style={{background:'#111',borderRadius:14,padding:14,color:'#fff',borderLeft:'5px solid #ffcc00',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:'800',color:'#ffcc00'}}>📊 STATS - PERFORMANCE + PAYS + EMAIL</div>
              <div style={{fontSize:11,color:'#ccc',marginTop:6}}>Produits qui percent, pays, email acheteurs, CA 7j/30j - Comme tu veux</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
              <div style={{padding:14,background:'#111',borderRadius:12,color:'#fff'}}><div style={{fontSize:10,color:'#888'}}>Produits qui percent</div><div style={{fontSize:14,fontWeight:'800',color:'#ffcc00',marginTop:4}}>{products.sort((a,b)=>b.price-a.price)[0]?.title||'Aucun'}</div></div>
              <div style={{padding:14,background:'#ffcc00',borderRadius:12}}><div style={{fontSize:10}}>CA 7j</div><div style={{fontSize:18,fontWeight:'800'}}>{orders.filter(o=>new Date(o.created_at)>new Date(Date.now()-7*24*60*60*1000)).reduce((s,o)=>s+(o.amount||0),0)} FCFA</div></div>
            </div>
            <div style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:'700',marginBottom:8}}>Emails acheteurs + Pays</div>
              {orders.slice(0,5).map(o=><div key={o.id} style={{padding:8,background:'#fafafa',borderRadius:8,marginBottom:6,fontSize:11}}><b>{o.buyer_email}</b> - {o.buyer_country} - {o.amount} FCFA</div>)}
            </div>
            <div style={{marginTop:16,padding:12,background:'#fff8cc',borderRadius:12,border:'1px solid #ffcc00'}}>
              <div style={{fontSize:11,fontWeight:'700'}}>💬 Commentaires apres achat - Comme tu demandes</div>
              <div style={{fontSize:10,color:'#666',marginTop:4}}>Acheteur achete → 2 jours apres message "Comment trouvez-vous produit de telle personne ?" → il peut laisser commentaire ou non</div>
              <input value={reviewForm.productId} onChange={e=>setReviewForm({...reviewForm,productId:e.target.value})} placeholder="ID Produit" style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #ddd',fontSize:11,marginTop:8}}/>
              <textarea value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm,comment:e.target.value})} placeholder="Commentaire apres achat" style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #ddd',fontSize:11,marginTop:6,minHeight:60}}/>
              <button onClick={submitReview} style={{width:'100%',marginTop:8,padding:10,borderRadius:8,background:'#111',color:'#ffcc00',border:'none',fontWeight:'700',fontSize:11}}>Laisser commentaire</button>
              <div style={{marginTop:10}}>
                {reviews.slice(0,5).map(r=><div key={r.id} style={{padding:8,background:'#fff',borderRadius:8,marginBottom:6,border:'1px solid #eee',fontSize:11}}><b>{r.rating}⭐</b> {r.comment} - <span style={{color:'#888'}}>{r.buyer_email}</span></div>)}
              </div>
            </div>
          </div>
        )}

        
        {tab==='profil' && (
          <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #eee'}}>
            <div style={{background:'#111',borderRadius:14,padding:14,color:'#fff',borderLeft:'5px solid #ffcc00',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:'800',color:'#ffcc00'}}>👤 MON PROFIL - INFOS PERSO</div>
              <div style={{fontSize:11,color:'#ccc',marginTop:6}}>Tes infos d'inscription - Modifiable - Stocké dans Supabase table profiles</div>
            </div>

            <div style={{background:'#111',borderRadius:16,padding:16,color:'#fff',marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:56,height:56,borderRadius:28,background:'#ffcc00',color:'#111',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:'800'}}>{profile?.first_name?.[0]||'D'}</div>
                <div>
                  <div style={{fontWeight:'800',fontSize:16}}>{profile?.first_name} {profile?.last_name}</div>
                  <div style={{fontSize:12,color:'#ffcc00'}}>{profile?.email}</div>
                  <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{profile?.age} ans - {profile?.aptitude} - ID: {user?.id?.slice(0,8)}</div>
                </div>
              </div>
            </div>

            <div style={{display:'grid',gap:10}}>
              <div style={{padding:12,background:'#fafafa',borderRadius:12,border:'1px solid #eee'}}>
                <div style={{fontSize:10,color:'#888'}}>NOM</div>
                <div style={{fontSize:13,fontWeight:'700',marginTop:2}}>{profile?.last_name||'-'}</div>
              </div>
              <div style={{padding:12,background:'#fafafa',borderRadius:12,border:'1px solid #eee'}}>
                <div style={{fontSize:10,color:'#888'}}>PRENOM</div>
                <div style={{fontSize:13,fontWeight:'700',marginTop:2}}>{profile?.first_name||'-'}</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div style={{padding:12,background:'#fafafa',borderRadius:12,border:'1px solid #eee'}}>
                  <div style={{fontSize:10,color:'#888'}}>AGE</div>
                  <div style={{fontSize:13,fontWeight:'700',marginTop:2}}>{profile?.age||'-'} ans</div>
                </div>
                <div style={{padding:12,background:'#fafafa',borderRadius:12,border:'1px solid #eee'}}>
                  <div style={{fontSize:10,color:'#888'}}>APTITUDE</div>
                  <div style={{fontSize:13,fontWeight:'700',marginTop:2}}>{profile?.aptitude||'-'}</div>
                </div>
              </div>
              <div style={{padding:12,background:'#fafafa',borderRadius:12,border:'1px solid #eee'}}>
                <div style={{fontSize:10,color:'#888'}}>EMAIL GMAIL</div>
                <div style={{fontSize:13,fontWeight:'700',marginTop:2}}>{profile?.email||user?.email||'-'}</div>
              </div>
              <div style={{padding:12,background:'#fafafa',borderRadius:12,border:'1px solid #eee'}}>
                <div style={{fontSize:10,color:'#888'}}>COMPTE CREE LE</div>
                <div style={{fontSize:11,marginTop:2}}>{user?.created_at?new Date(user.created_at).toLocaleDateString('fr-FR'): '-'}</div>
              </div>
            </div>

            <div style={{marginTop:16,padding:12,background:'#fff8cc',borderRadius:12,border:'1px solid #ffcc00'}}>
              <div style={{fontSize:11,fontWeight:'700'}}>🔐 Flux inscription - Comment ca marche dans Supabase:</div>
              <div style={{fontSize:10,color:'#666',marginTop:6,lineHeight:'1.6'}}>
                1. User remplit Nom/Prenom/Age/Aptitude/Email/Mot de passe perso → clique Creer compte<br/>
                2. Action declenchee → supabase.auth.signUp() → Supabase cree user dans auth.users<br/>
                3. Supabase envoie automatiquement code verification a Gmail (si Email Confirm active)<br/>
                4. User clique lien Gmail → compte verifie → profile insere dans table profiles<br/>
                5. User se connecte avec Email + mot de passe perso → Interface perso active
              </div>
            </div>

            <div style={{marginTop:16,display:'grid',gap:8}}>
              <button onClick={handleLogout} style={{width:'100%',padding:14,borderRadius:12,border:'1px solid #ff4444',background:'#fff',color:'#ff4444',fontWeight:'800'}}>🚪 Se deconnecter</button>
              <div style={{fontSize:10,color:'#888',textAlign:'center',marginTop:4}}>Deconnexion → retour page Connexion/Inscription</div>
            </div>
          </div>
        )}

        {tab==='admin' && (
          <div style={{background:'#111',borderRadius:18,padding:18,color:'#fff',border:'2px solid #ffcc00'}}>
            <div style={{fontWeight:'800',fontSize:15}}>👑 Admin - Centre controle total prive - Supabase</div>
            <div style={{marginTop:14,background:'#222',padding:14,borderRadius:12,borderLeft:'4px solid #ffcc00'}}>
              <div style={{fontSize:12,color:'#ffcc00',fontWeight:'800'}}>📢 ENVOYER ANNONCE A TOUS - Comme Orange Money promo</div>
              <div style={{fontSize:11,color:'#aaa',marginTop:6}}>Tu envoies 1 message → tous utilisateurs le voient comme Orange Money</div>
              <input value={announceForm.title} onChange={e=>setAnnounceForm({...announceForm,title:e.target.value})} placeholder="Titre annonce" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ffcc00',marginTop:10,fontSize:12,color:'#111'}}/>
              <textarea value={announceForm.message} onChange={e=>setAnnounceForm({...announceForm,message:e.target.value})} placeholder="Message promo ex: Promo demain -50%" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ddd',marginTop:8,fontSize:12,minHeight:60,color:'#111'}}/>
              <button onClick={createAnnouncement} style={{width:'100%',marginTop:10,padding:12,borderRadius:8,background:'#ffcc00',color:'#111',border:'none',fontWeight:'800'}}>📢 Envoyer annonce a tous</button>
            </div>
            <div style={{marginTop:14,background:'#222',padding:14,borderRadius:12}}>
              <div style={{fontSize:11,color:'#888'}}>Tout dans Supabase - Tu controles tout</div>
              <div style={{fontSize:11,marginTop:6,lineHeight:'1.6'}}>Profiles: {profile?.first_name} - Stores: {stores.length} - Products: {products.length} - Orders: {orders.length} - Annonces: {announcements.length} - Reviews: {reviews.length} - Qui a fait quoi, quand, depuis ou, tout est dans Supabase</div>
            </div>
          </div>
        )}
      </div>

      <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:480,margin:'0 auto',background:'#fff',borderTop:'1px solid #eee',display:'flex',padding:'6px 0 10px 0'}}>
        {[{k:'accueil',icon:'🏠',label:'Accueil'},{k:'produits',icon:'📦',label:'Produits'},{k:'ventes',icon:'💰',label:'Ventes'},{k:'statistiques',icon:'📊',label:'Stats'},{k:'profil',icon:'👤',label:'Profil'},{k:'admin',icon:'👑',label:'Admin'}].map(b=>(
          <button key={b.k} onClick={()=>setTab(b.k)} style={{flex:1,background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:2,color:tab===b.k?'#111':'#999',fontSize:10,fontWeight:tab===b.k?'700':'400'}}>
            <div style={{width:32,height:32,borderRadius:16,background:tab===b.k?'#ffcc00':'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{b.icon}</div>
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}
