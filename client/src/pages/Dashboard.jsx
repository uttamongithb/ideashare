import React from 'react'
import { Navigate } from 'react-router-dom'

// Dashboard page removed — redirect to Profile
export default function Dashboard(){
  return <Navigate to="/profile" replace />
}
