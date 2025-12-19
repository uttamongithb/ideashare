import React, {useState, useEffect} from 'react'
import API from '../api'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../components/Toast'

export default function AddEditIdea(){
  const [title,setTitle] = useState('')
  const [description,setDescription] = useState('')
  const [tags,setTags] = useState([])
  const [tagText, setTagText] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  const { id } = useParams()
  const toast = useToast()

  useEffect(()=>{
    if (id) load()
  },[id])

  const load = async () => {
    try{
      const res = await API.get('/ideas')
      const idea = res.data.find(i=>i._id===id)
      if (idea){ setTitle(idea.title); setDescription(idea.description); setTags(idea.tags||[]) }
    }catch(err){console.error(err); toast && toast('Failed to load idea')}
  }

  const addTag = () => {
    const t = tagText.trim()
    if (!t) return
    if (!tags.includes(t)) setTags([...tags, t])
    setTagText('')
  }

  const removeTag = (t) => setTags(tags.filter(x=>x!==t))

  const submit = async e => {
    e.preventDefault()
    if (!title.trim()) return toast && toast('Title is required')
    setBusy(true)
    try{
      const payload = { title, description, tags }
      if (id) await API.put(`/ideas/${id}`, payload)
      else await API.post('/ideas', payload)
      toast && toast(id ? 'Idea updated' : 'Idea created')
      nav('/profile')
    }catch(err){
      console.error(err)
      toast && toast(err.response?.data?.message || err.message)
    }finally{ setBusy(false) }
  }

  return (
    <div className="container" style={{padding:20}}>
      <div className="add-idea-grid">
        <div className="idea-form">
          <h2 className="font-rethink">{id ? 'Edit' : 'Add'} Idea</h2>
          <form onSubmit={submit}>
            <label className="profile-label">Title</label>
            <input className="profile-input" placeholder='A short, descriptive title' value={title} onChange={e=>setTitle(e.target.value)} />

            <label className="profile-label">Description</label>
            <textarea className="profile-input" placeholder='Explain the idea and its value' value={description} onChange={e=>setDescription(e.target.value)} rows={6} />

            <label className="profile-label">Tags</label>
            <div className="tag-input-row">
              <input className="profile-input" placeholder='Add a tag and press Add' value={tagText} onChange={e=>setTagText(e.target.value)} />
              <button type="button" className="btn-ghost" onClick={addTag}>Add</button>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
              {tags.map(t=> (
                <div key={t} className="chip font-spot">{t} <button className="tag-remove" onClick={()=>removeTag(t)}>×</button></div>
              ))}
            </div>

            <div style={{display:'flex',gap:12,alignItems:'center',marginTop:12}}>
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : (id ? 'Update Idea' : 'Create Idea')}</button>
              <button type="button" className="btn-ghost" onClick={()=>nav('/profile')}>Cancel</button>
            </div>
          </form>
        </div>

        <div className="idea-preview">
          <h4 className="section-heading">Preview</h4>
          <div className="idea-card-inner">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <strong className="font-rethink">{localTitleOr(title)}</strong>
                <div className="meta-date">Preview</div>
              </div>
            </div>
            <h3 className="idea-title">{title || 'Title goes here'}</h3>
            <p className="idea-desc">{description || 'Description will appear here as you type.'}</p>
            <div className="tags-row">
              {tags.map(t => <div key={t} className="chip font-spot">{t}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function localTitleOr(t){ return t && t.length>0 ? t : 'Untitled idea' }
