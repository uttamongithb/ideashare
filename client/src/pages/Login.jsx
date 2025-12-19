import React, {useState} from 'react'
import API, { setToken } from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    try{
      const res = await API.post('/auth/login',{ email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      // notify other components (Navbar) that auth state changed
      try { window.dispatchEvent(new Event('authChange')) } catch(e) {}
      nav('/dashboard')
    }catch(err){
      alert(err.response?.data?.message || err.message)
    }
  }

  return (
    <div style={{padding:40}}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{maxWidth:400}}>
        <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:8,marginBottom:8}} />
        <input placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:8,marginBottom:8}} />
        <button style={{padding:10}}>Login</button>
      </form>
      <p>Don't have an account? <Link to='/signup'>Sign up</Link></p>
    </div>
  )
}
