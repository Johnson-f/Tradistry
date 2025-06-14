import React, { useState } from 'react'
import { supabase } from '../supabaseClient' // Import the supabase client  
import { useNavigate, Link } from 'react-router-dom' // Import the useNavigate hook from react-router-dom

export default function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (!formData.rememberMe) {
            setError('You must agree to the Terms of Service and Privacy Policy')
            return
        }
        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        })
        if (error) setError(error.message)
            else {
                setSuccess('Signup successful! Please check your email to confirm your account.')
                setTimeout(() => navigate('/Login.jsx'), 2000)
        }
    }

    const handleGoogleSignUp = async () => {
        setError('')
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/Dashboard.jsx' },
        })
        if (error) setError(error.message)
    }

    const handleDiscordSignUp = async () => {
        setError('')
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: { redirectTo: window.location.origin + '/Dashboard.jsx' },
        })
        if (error) setError(error.message)
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Trading Chart Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
                {/* Grid Lines */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Trading Chart Lines */}
                <path d="M50 400 L150 350 L250 380 L350 320 L450 340 L550 280 L650 300 L750 240 L850 260 L950 200 L1050 220 L1150 180"
                    stroke="#10b981" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M50 450 L150 420 L250 440 L350 380 L450 400 L550 360 L650 380 L750 320 L850 340 L950 280 L1050 300 L1150 260"
                    stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.6" />

                {/* Candlestick patterns */}
                <g opacity="0.4">
                    <rect x="100" y="330" width="8" height="40" fill="#10b981" />
                    <rect x="150" y="340" width="8" height="30" fill="#ef4444" />
                    <rect x="200" y="320" width="8" height="50" fill="#10b981" />
                    <rect x="250" y="350" width="8" height="35" fill="#ef4444" />
                    <rect x="300" y="310" width="8" height="60" fill="#10b981" />
                </g>
            </svg>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>

        {/* Main Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 w-full max-w-lg border border-white/20 relative z-10">
            {/* Header */}
            <div className="text-center mb-4">
                <div className="mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 13h2v4H3v-4zm4-6h2v10H7V7zm4-4h2v14h-2V3zm4 2h2v12h-2V5zm4 4h2v8h-2V9z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Tradistry</h1>
                <p className="text-sm text-gray-600">
                    Already tracking your trades?{' '}
                    <Link to="/Login.jsx" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                        Login
                    </Link>
                </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email address"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none bg-gray-50/50 text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password (min. 8 characters)"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none bg-gray-50/50 text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none bg-gray-50/50 text-sm"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="rememberMe" className="ml-3 text-sm text-gray-700">
                        I agree to the Terms of Service and Privacy Policy
                    </label>
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] shadow-lg text-sm"
                >
                    Start Trading Journal
                </button>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-sm">
                        {error}
                    </div>
                )}
                {/* Divider */}
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">or</span>
                    </div>
                </div>

                {/* Google Sign Up button */}
                <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                            </svg>
                                            <span>Continue with Google</span>
                    </button>

                    {/* Discord Sign Up button */}
                    <button
                        type="button"
                        onClick={handleDiscordSignUp}
                        className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-[1.02] text-sm"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            <span>Continue with Discord</span>
                        </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500">
                <p>By signing up, you agree to track your trades responsibly</p>
            </div>
        </div>
    </div>
    )
}

// Going to style this with tailwind and add Google & Discord sign up & login buttons 