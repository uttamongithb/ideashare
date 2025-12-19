import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AddEditIdea from './pages/AddEditIdea'
import Navbar from './components/Navbar'
import Explore from './pages/Explore'
import Profile from './pages/Profile'

export default function App(){
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/idea/:id' element={<AddEditIdea/>} />
        <Route path='/add' element={<AddEditIdea/>} />
        <Route path='/explore' element={<Explore/>} />
        <Route path='/profile' element={<Profile/>} />
      </Routes>
    </div>
  )
}
