import React, { useState, useEffect } from 'react'
import API, { setToken } from '../api'
import IdeaCard from '../components/IdeaCard'

export default function Explore(){
  const [q, setQ] = useState('')
  const [tags, setTags] = useState('')
  const [ideas, setIdeas] = useState([])

  useEffect(()=>{ const t = localStorage.getItem('token'); if (t) setToken(t); fetch() }, [])

  // auto-fetch when search inputs change (debounced)
  useEffect(()=>{
    const id = setTimeout(()=>{
      // when inputs change we fetch fresh results
      fetch()
    }, 300)
    return ()=>clearTimeout(id)
  }, [q, tags])

  const fetch = async () => {
    try{
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (tags) params.set('tags', tags)
      const res = await API.get('/ideas?' + params.toString())
      setIdeas(res.data)
    }catch(err){ console.error(err) }
  }

  return (
    <div style={{padding:20}}>
      <h2>Explore Ideas</h2>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <input placeholder='Search ideas' value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,padding:8}} />
        <input placeholder='Tags (comma separated)' value={tags} onChange={e=>setTags(e.target.value)} style={{width:260,padding:8}} />
        <button onClick={fetch} style={{padding:'8px 12px'}}>Search</button>
      </div>
      <div>
        {ideas.map(i=> <IdeaCard key={i._id} idea={i} onUpdate={fetch} />)}
        {ideas.length===0 && <p>No results</p>}
      </div>
    </div>
  )
}
