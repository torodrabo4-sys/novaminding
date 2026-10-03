import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import CreateStore from './pages/CreateStore'
import CreateProduct from './pages/CreateProduct'
import Dashboard from './pages/Dashboard'

function Navbar(){
  return(
    <div style={{display:'flex', gap:'12px', padding:'15px', borderBottom:'1px solid #eee', fontFamily:'sans-serif', overflowX:'auto'}}>
      <Link to="/" style={{fontWeight:'bold', textDecoration:'none', color:'black', whiteSpace:'nowrap'}}>NovaMinding</Link>
      <Link to="/auth" style={{textDecoration:'none', color:'#333'}}>Connexion</Link>
      <Link to="/create-store" style={{textDecoration:'none', color:'#333', whiteSpace:'nowrap'}}>Ma Boutique</Link>
      <Link to="/create-product" style={{textDecoration:'none', color:'#333', whiteSpace:'nowrap'}}>Ajouter Produit</Link>
      <Link to="/dashboard" style={{textDecoration:'none', color:'black', fontWeight:'bold', whiteSpace:'nowrap'}}>💰 Wallet + Boost</Link>
    </div>
  )
}
export default function App(){
  return(
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/create-store" element={<CreateStore />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
