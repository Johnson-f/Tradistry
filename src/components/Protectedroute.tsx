import React from 'react'
import { Navigate } from 'react-router-dom'

const Protectedroute = ({ user, children }) => {
    if (!user) {
        return <Navigate to="/Login" replace />
    }
  return children 
}

export default Protectedroute
