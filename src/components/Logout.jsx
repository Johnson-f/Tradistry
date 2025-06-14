import React from 'react'
import { supabase } from '../supabaseclient'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
    const navigate = useNavigate()
    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/Login.jsx')
    }
  return (
    <div>
        <button 
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
            Logout
        </button>
      
    </div>
  )
}

export default Logout
