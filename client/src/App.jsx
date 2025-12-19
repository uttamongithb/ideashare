import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AddEditIdea from './pages/AddEditIdea'
import Navbar from './components/Navbar'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import RequireAuth from './components/RequireAuth'

export default function App(){
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        {/* Dashboard page removed; use Profile for user ideas */}
        <Route path='/idea/:id' element={<RequireAuth><AddEditIdea/></RequireAuth>} />
        <Route path='/add' element={<RequireAuth><AddEditIdea/></RequireAuth>} />
        <Route path='/explore' element={<RequireAuth><Explore/></RequireAuth>} />
        <Route path='/profile' element={<RequireAuth><Profile/></RequireAuth>} />
      </Routes>
    </div>
  )
}
