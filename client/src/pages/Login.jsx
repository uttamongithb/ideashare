import React, {useState} from 'react'
import API, { setToken } from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setBusy(true)
    try{
      const res = await API.post('/auth/login',{ email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      try { window.dispatchEvent(new Event('authChange')) } catch(e) {}
      nav('/dashboard')
    }catch(err){
      alert(err.response?.data?.message || err.message)
    }finally{ setBusy(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue to IdeaShare</p>

        <form className="auth-form" onSubmit={submit}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="profile-input" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="profile-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
            <button className="btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
            <Link to="/signup" className="auth-link">Create account</Link>
          </div>
        </form>

        <div className="auth-footer">By signing in you agree to our terms and privacy.</div>
      </div>
    </div>
  )
}
