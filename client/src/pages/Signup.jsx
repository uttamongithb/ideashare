import React, {useState} from 'react'
import API, { setToken } from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setBusy(true)
    try{
      const res = await API.post('/auth/register',{ name, email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      try { window.dispatchEvent(new Event('authChange')) } catch(e) {}
      nav('/profile')
    }catch(err){
      alert(err.response?.data?.message || err.message)
    }finally{ setBusy(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join IdeaShare and start sharing ideas.</p>

        <form className="auth-form" onSubmit={submit}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input className="profile-input" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="profile-input" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="profile-input" type="password" placeholder="Choose a secure password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
            <button className="btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
            <Link to="/login" className="auth-link">Already a member?</Link>
          </div>
        </form>

        <div className="auth-footer">No credit card required • Free to use</div>
      </div>
    </div>
  )
}
