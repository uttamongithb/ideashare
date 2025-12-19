import React, {useEffect, useState} from 'react'
import API, { setToken } from '../api'
import IdeaCard from '../components/IdeaCard'
import Loader from '../components/Loader'
import socket from '../socket'

export default function Dashboard(){
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if (token) setToken(token)
    fetchIdeas()
    const id = setInterval(fetchIdeas, 10000)
    const onChange = () => fetchIdeas()
    socket.on('idea:created', onChange)
    socket.on('idea:updated', onChange)
    socket.on('idea:deleted', onChange)
    socket.on('idea:liked', onChange)
    socket.on('idea:commented', onChange)
    return ()=>{
      clearInterval(id)
      socket.off('idea:created', onChange)
      socket.off('idea:updated', onChange)
      socket.off('idea:deleted', onChange)
      socket.off('idea:liked', onChange)
      socket.off('idea:commented', onChange)
    }
  },[])

  const fetchIdeas = async () => {
    try{
      setLoading(true)
      const res = await API.get('/ideas')
      setIdeas(res.data)
    }catch(err){
      console.error(err)
    }finally{ setLoading(false) }
  }

  return (
    <div className="dashboard-grid" style={{gap:20,padding:20}}>
      <main className="feed">
        {loading ? <Loader /> : (
          <>
            {ideas.length===0 ? (
              <div className="empty-state">
                <h3>No ideas yet</h3>
                <p>Be the first to add your idea — it's quick and easy.</p>
                <a href="/add" className="btn-primary">Add your idea</a>
              </div>
            ) : (
              ideas.map(i => <IdeaCard key={i._id} idea={i} onUpdate={fetchIdeas} />)
            )}
          </>
        )}
      </main>
    </div>
  )
}
