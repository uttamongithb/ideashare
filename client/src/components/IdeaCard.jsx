import React, { useState } from 'react'
import API, { setToken } from '../api'
import { useNavigate } from 'react-router-dom'
import { useToast } from './Toast'

export default function IdeaCard({ idea, onUpdate }){
  const [busy, setBusy] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [localIdea, setLocalIdea] = useState(idea)
  const [showAll, setShowAll] = useState(false)
  const nav = useNavigate()
  const toast = useToast()

  const token = localStorage.getItem('token')
  if (token) setToken(token)

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })()

  const authorId = idea?.author?._id || idea?.author?.id || idea?.author
  const currentId = currentUser?.id || currentUser?._id

  const like = async () => {
    // optimistic update
    const userId = (() => { try{ return JSON.parse(localStorage.getItem('user')||'null').id } catch { return null } })()
    const already = (localIdea.likes || []).some(id => id === userId || id === (userId && userId.toString()))
    const prevLikes = localIdea.likes || []
    const newLikes = already ? prevLikes.filter(l => l !== userId) : [...prevLikes, userId]
    setLocalIdea({...localIdea, likes: newLikes})
    try{
      await API.post(`/ideas/${localIdea._id}/like`)
      onUpdate && onUpdate()
    }catch(err){
      setLocalIdea({...localIdea, likes: prevLikes})
      console.error(err)
      toast && toast('Failed to like')
    }
  }

  const remove = async () => {
    if (!confirm('Delete this idea?')) return
    try{
      setBusy(true)
      await API.delete(`/ideas/${localIdea._id}`)
      toast && toast('Idea deleted')
      onUpdate && onUpdate()
    }catch(err){
      console.error(err)
      toast && toast('Delete failed')
    }finally{ setBusy(false) }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    const curUser = (() => { try{ return JSON.parse(localStorage.getItem('user')||'null') }catch{return null} })()
    const temp = { _id: 'tmp-' + Date.now(), text: commentText, createdAt: new Date().toISOString(), user: { name: curUser?.name } }
    // optimistic
    const prevComments = localIdea.comments || []
    setLocalIdea({...localIdea, comments: [...prevComments, temp]})
    setCommentText('')
    try{
      const res = await API.post(`/ideas/${localIdea._id}/comment`, { text: temp.text })
      setLocalIdea(res.data)
      onUpdate && onUpdate()
      toast && toast('Comment added')
    }catch(err){
      setLocalIdea({...localIdea, comments: prevComments})
      console.error(err)
      toast && toast('Comment failed')
    }
  }

  const goEdit = () => nav(`/idea/${localIdea._id}`)

  return (
    <div className="idea-card" style={{marginBottom:18}}>
      <div className="idea-card-inner">
        <div className="idea-header">
          <div>
            <strong className="font-rethink">{idea.author?.name || 'Unknown'}</strong>
            <div className="font-spot meta-date">{new Date(idea.createdAt).toLocaleString()}</div>
          </div>
        </div>

        {currentUser && String(authorId) === String(currentId) && (
          <div className="idea-actions">
            <button className="btn-edit" onClick={goEdit} disabled={busy}>Edit</button>
            <button className="btn-delete" onClick={remove} disabled={busy}>Delete</button>
          </div>
        )}

        <h3 className="font-rethink idea-title">{idea.title}</h3>
        <p className="idea-desc">{idea.description}</p>

        <div className="tags-row">
          {(idea.tags||[]).map((t,i) => (
            <div key={i} className="chip font-spot">{t}</div>
          ))}
        </div>

        <div className="idea-actions-row">
          <button className="btn-like" onClick={like} disabled={busy}>Like ({idea.likes?.length||0})</button>
          <button className="btn-comment" disabled style={{cursor:'default'}}>Comment</button>
        </div>

        <div className="comments-block">
          <strong className="comments-title">Comments</strong>
          <div className="comments-list">
            {((localIdea.comments||[]).slice(0, showAll ? undefined : 3)).map(c=> (
              <div key={c._id || c.createdAt} className="comment-row">
                <div className="avatar">{(c.user?.name || '?').charAt(0).toUpperCase()}</div>
                <div className="comment-body">
                  <div className="font-rethink comment-author">{c.user ? c.user.name : 'Unknown'}</div>
                  <div className="comment-text">{c.text}</div>
                  <div className="font-spot comment-date">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {(localIdea.comments||[]).length > 3 && (
              <button className="show-more" onClick={() => setShowAll(s=>!s)}>{showAll ? 'Show less' : `Show all (${localIdea.comments.length})`}</button>
            )}
          </div>

          <form onSubmit={submitComment} className="comment-form">
            <input className="comment-input" value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder={currentUser ? `Comment as ${currentUser.name}` : 'Write a comment'} />
            <button className="comment-send" disabled={busy}>Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}
