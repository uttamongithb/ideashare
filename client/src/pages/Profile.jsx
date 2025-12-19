import React, { useState, useEffect } from 'react'
import API, { setToken } from '../api'
import { useToast } from '../components/Toast'
import IdeaCard from '../components/IdeaCard'

export default function Profile(){
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  useEffect(()=>{
    const t = localStorage.getItem('token')
    if (t) setToken(t)
    load()
  },[])

  const load = async ()=>{
    try{
      const res = await API.get('/profile')
      const u = res.data
      setUser(u)
      setName(u.name || '')
      setBio(u.bio || '')
      setAvatarPreview(u.avatar || null)
      // load ideas and filter by author
      const r2 = await API.get('/ideas')
      const all = r2.data || []
      const my = all.filter(i => i.author && (String(i.author._id) === String(u.id || u._id || u._id)))
      setIdeas(my)
    }catch(err){
      console.error(err)
      toast && toast('Failed to load profile')
    }
  }

  const pick = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try{
      const form = new FormData()
      form.append('name', name)
      form.append('bio', bio)
      if (avatarFile) form.append('avatar', avatarFile)
      const res = await API.put('/profile', form)
      const updated = res.data
      setUser(updated)
      setAvatarPreview(updated.avatar || avatarPreview)
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')||'{}'), name: updated.name, avatar: updated.avatar, bio: updated.bio }))
      // notify other components (Navbar) that auth/user changed
      window.dispatchEvent(new Event('authChange'))
      toast && toast('Profile saved')
    }catch(err){
      console.error(err)
      toast && toast('Save failed')
    }finally{ setBusy(false) }
  }

  const refreshIdeas = async () => {
    try{
      const r2 = await API.get('/ideas')
      const all = r2.data || []
      const my = all.filter(i => i.author && (String(i.author._id) === String(user.id || user._id || user._id)))
      setIdeas(my)
    }catch(err){ console.error(err) }
  }

  if (!user) return <div className="profile-page">Loading...</div>
  return (
    <div className="profile-page container">
      <h2 className="font-rethink">Profile</h2>

      <div className="profile-grid">
        <aside className="profile-card">
          <div className="profile-top">
            <div className="avatar-wrap">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="avatar-xl" />
              ) : (
                <div className="avatar-placeholder">{(user.name||'?').charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="profile-meta">
              <div className="profile-name font-rethink">{user.name}</div>
              <div className="profile-email" style={{color:'#6b7280',fontSize:13}}>{user.email}</div>
            </div>
          </div>

          <form onSubmit={submit} className="profile-edit">
            <label className="profile-label">Name</label>
            <input className="profile-input" value={name} onChange={e=>setName(e.target.value)} />

            <label className="profile-label">Avatar</label>
            <input type='file' accept='image/*' onChange={pick} />
            <div style={{height:8}} />

            <label className="profile-label">Bio</label>
            <textarea className="profile-input" value={bio} onChange={e=>setBio(e.target.value)} rows={4} />

            <div style={{display:'flex',gap:10,marginTop:12}}>
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save Profile'}</button>
              <button type="button" className="btn-ghost" onClick={() => { setName(user.name||''); setBio(user.bio||''); setAvatarFile(null); setAvatarPreview(user.avatar||null) }}>Cancel</button>
            </div>
          </form>

          <div className="profile-stats">
            <div className="stat"><div className="stat-number">{ideas.length}</div><div className="stat-label">Ideas</div></div>
            <div className="stat"><div className="stat-number">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</div><div className="stat-label">Member since</div></div>
          </div>
        </aside>

        <section className="ideas-grid">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 className="section-heading">Your Ideas</h3>
          </div>
          {ideas.length === 0 ? (
            <div className="empty-state">You haven't posted any ideas yet.</div>
          ) : (
            <div className="ideas-grid-inner">
              {ideas.map(i => (
                <IdeaCard key={i._id} idea={i} onUpdate={refreshIdeas} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
