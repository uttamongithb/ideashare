import React, { useState, useEffect } from 'react'
import API, { setToken } from '../api'
import IdeaCard from '../components/IdeaCard'

export default function Explore(){
  const [q, setQ] = useState('')
  const [tags, setTags] = useState('')
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ const t = localStorage.getItem('token'); if (t) setToken(t); fetchIdeas() }, [])

  // auto-fetch when search inputs change (debounced)
  useEffect(()=>{
    const id = setTimeout(()=>{ fetchIdeas() }, 300)
    return ()=>clearTimeout(id)
  }, [q, tags])

  const fetchIdeas = async () => {
    try{
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (tags) params.set('tags', tags)
      const res = await API.get('/ideas?' + params.toString())
      setIdeas(res.data)
    }catch(err){ console.error(err) }
    finally{ setLoading(false) }
  }

  return (
    <div className="container" style={{padding:20}}>
      <header className="explore-header" style={{marginBottom:18}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <div>
            <h2 className="section-heading">Explore Ideas</h2>
            <p style={{margin:6,color:'#6b7280'}}>Discover trending ideas, filter by tag or search keywords.</p>
          </div>
        </div>

        <div className="search-row" style={{marginTop:12}}>
          <input
            className="search-input"
            placeholder="Search ideas, titles or descriptions"
            value={q}
            onChange={e=>setQ(e.target.value)}
          />

          <input
            className="tag-input"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={e=>setTags(e.target.value)}
          />

          <button className="search-btn" onClick={fetchIdeas} disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
        </div>
      </header>

      <main>
        {ideas.length === 0 && !loading ? (
          <div className="empty-state" style={{padding:30}}>
            <h3>No results</h3>
            <p>Try different keywords or remove tag filters to find ideas.</p>
          </div>
        ) : (
          <div className="ideas-grid">
            {ideas.map(i=> (
              <div key={i._id} className="ideas-grid-item">
                <IdeaCard idea={i} onUpdate={fetchIdeas} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
