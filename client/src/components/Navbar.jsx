import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API, { setToken } from '../api'

export default function Navbar(){
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')||'null') } catch { return null }
  })

  const token = localStorage.getItem('token')

  const logout = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); setCurrentUser(null); window.location.href = '/' }

  useEffect(()=>{
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  },[])

  useEffect(()=>{
    // If a token exists but no user in localStorage, fetch profile once
    if (token && !currentUser){
      setToken(token)
      API.get('/profile').then(res=>{
        localStorage.setItem('user', JSON.stringify(res.data))
        setCurrentUser(res.data)
      }).catch(()=>{
        localStorage.removeItem('user')
        setCurrentUser(null)
      })
    }
  },[token, currentUser])

  useEffect(() => {
    const onAuthChange = () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null')
        setCurrentUser(u)
      } catch (e) {
        setCurrentUser(null)
      }
    }
    window.addEventListener('authChange', onAuthChange)
    return () => window.removeEventListener('authChange', onAuthChange)
  }, [])

  const initials = currentUser && currentUser.name ? currentUser.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() : ''

  return (
    <div className="nav" style={{display:'flex',justifyContent:'space-between',padding:12,boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}>
      <div><Link to='/' className="logo font-rethink">IdeaShare</Link></div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link to='/explore' className="btn-ghost" style={{marginRight:12}}>Explore ideas</Link>
        <Link to='/add' style={{marginRight:12}}>Add Idea</Link>

        {token && currentUser ? (
          <div ref={ref} style={{position:'relative'}}>
            <div className="profile-badge" onClick={()=>setOpen(s=>!s)} style={{cursor:'pointer'}}>
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
              ) : (
                (initials || 'U')
              )}
            </div>
            {open && (
              <div className="profile-menu" style={{position:'absolute',right:0,top:48,minWidth:160,background:'#fff',boxShadow:'0 6px 18px rgba(0,0,0,0.12)',borderRadius:8,padding:8}}>
                <div style={{padding:'8px 10px',borderBottom:'1px solid #eef2f7',fontWeight:700}}>{currentUser.name}</div>
                <Link to='/profile' onClick={()=>setOpen(false)} style={{display:'block',padding:8}}>Profile</Link>
                <Link to='/dashboard' onClick={()=>setOpen(false)} style={{display:'block',padding:8}}>My Ideas</Link>
                <button onClick={logout} style={{display:'block',width:'100%',textAlign:'left',padding:8,background:'transparent',border:'none',cursor:'pointer'}}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to='/login'>Login</Link>
            <Link to='/signup' style={{marginLeft:8}}>Signup</Link>
          </>
        )}
      </div>
    </div>
  )
}
