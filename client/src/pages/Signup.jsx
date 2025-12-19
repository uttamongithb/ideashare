import React, {useState} from 'react'
import API, { setToken } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Signup(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    try{
      const res = await API.post('/auth/register',{ name, email, password })
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
      <h2>Sign up</h2>
      <form onSubmit={submit} style={{maxWidth:400}}>
        <input placeholder='Name' value={name} onChange={e=>setName(e.target.value)} style={{display:'block',width:'100%',padding:8,marginBottom:8}} />
        <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:8,marginBottom:8}} />
        <input placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:8,marginBottom:8}} />
        <button style={{padding:10,background:'#16a34a',color:'#fff'}}>Sign up</button>
      </form>
    </div>
  )
}
