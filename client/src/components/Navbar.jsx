import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import API, { setToken } from '../api'

export default function Navbar(){
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')||'null') } catch { return null }
  })
  const [avatarBroken, setAvatarBroken] = useState(false)
  const [avatarTry, setAvatarTry] = useState(0)

  const token = localStorage.getItem('token')

  const logout = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); setCurrentUser(null); window.location.href = '/' }

  useEffect(()=>{
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  },[])

  useEffect(()=>{
    // keep local state stable — canonical profile is fetched in later effect
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

  // compute avatar URL candidates: try stored value, API-prefixed, and origin-prefixed
  const apiRoot = useMemo(() => {
    const b = API?.defaults?.baseURL || import.meta.env.VITE_API_URL || ''
    return ('' + b).replace(/\/api\/?$/, '').replace(/\/$/, '')
  }, [])

  const avatarCandidates = useMemo(() => {
    const out = []
    if (!currentUser?.avatar) return out
    // normalize stored avatar value (trim and strip wrapping quotes)
    let raw = ('' + currentUser.avatar).trim()
    raw = raw.replace(/^\"|\"$/g, '')
    raw = raw.replace(/^\'|\'$/g, '')
    if (!raw) return out

    // push raw first (works for blob:, data:, absolute URLs)
    out.push(raw)

    // protocol-relative URLs (//host/path)
    if (raw.startsWith('//')) {
      out.push(window.location.protocol + raw)
    }

    // absolute http/https keep as-is (already pushed)

    // leading slash: try apiRoot and window.origin prefixes
    if (raw.startsWith('/')) {
      if (apiRoot) out.push(apiRoot + raw)
      out.push(window.location.origin.replace(/\/$/, '') + raw)
    }

    // filename only (no slash, no protocol) -> try uploads path on apiRoot
    if (!raw.startsWith('/') && !raw.startsWith('http') && !raw.startsWith('blob:') && !raw.startsWith('data:')) {
      const base = apiRoot || window.location.origin.replace(/\/$/, '')
      out.push(base + '/uploads/avatars/' + raw)
    }

    // dedupe while preserving order
    return Array.from(new Set(out))
  }, [currentUser?.avatar, apiRoot])

  const avatarSrc = avatarCandidates[avatarTry] || null

  // removed debug logging in production

  useEffect(()=>{
    // reset try index and broken flag when avatar value changes
    setAvatarTry(0)
    setAvatarBroken(false)
  }, [currentUser?.avatar])

  // Ensure we have the canonical profile data from server (same source as Profile page)
  useEffect(() => {
    if (!token) return
    setToken(token)
    API.get('/profile').then(res => {
      const u = res.data
      // only update if avatar differs (avoid re-render loop)
      if (!currentUser || (u.avatar || '') !== (currentUser.avatar || '')) {
        try { localStorage.setItem('user', JSON.stringify(u)) } catch (e) {}
        setCurrentUser(u)
      }
    }).catch(()=>{
      // ignore; existing logic handles unauthenticated state
    })
    // run once when token changes
  }, [token])

  return (
    <div className="nav" style={{display:'flex',justifyContent:'space-between',padding:12,boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}>
      <div><Link to='/' className="logo font-rethink">IdeaShare</Link></div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link to='/explore' className="btn-ghost" style={{marginRight:12}}>Explore ideas</Link>
        <Link to='/add' style={{marginRight:12}}>Add Idea</Link>

        {token && currentUser ? (
          <div ref={ref} style={{position:'relative'}}>
            <div className="profile-badge" onClick={()=>setOpen(s=>!s)} style={{cursor:'pointer'}}>
              {/* show image when available and not broken, otherwise show initials fallback */}
              {avatarSrc ? (
                <>
                  <img
                    key={avatarSrc || 'avatar-fallback'}
                    src={avatarSrc}
                    alt={currentUser.name}
                    style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}
                    onError={(e)=>{
                      // try the next candidate if available
                      const next = avatarTry + 1
                      if (next < avatarCandidates.length) {
                        setAvatarTry(next)
                        setAvatarBroken(false)
                      } else {
                        setAvatarBroken(true)
                      }
                    }}
                  />
                  {avatarBroken && (initials || 'U')}
                </>
              ) : (
                (initials || 'U')
              )}
            </div>
            {open && (
              <div className="profile-menu" style={{position:'absolute',right:0,top:48,minWidth:160,background:'#fff',boxShadow:'0 6px 18px rgba(0,0,0,0.12)',borderRadius:8,padding:8}}>
                <div style={{padding:'8px 10px',borderBottom:'1px solid #eef2f7',fontWeight:700}}>{currentUser.name}</div>
                <Link to='/profile' onClick={()=>setOpen(false)} style={{display:'block',padding:8}}>Profile</Link>
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
