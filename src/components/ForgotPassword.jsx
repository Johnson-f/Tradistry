import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleReset = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) setError(error.message)
            else setMessage('Password reset email sent! Check your inbox.')
    }

  return (
    <div className="flex items-center justify-center min-h screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
            <form onSubmit={handleReset} className="space-y-4">
            <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Send Reset Email
          </button>
          {message && <p className="text-green-500 text-center">{message}</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
            </form>
        </div>
    </div>
  )
}

export default ForgotPassword