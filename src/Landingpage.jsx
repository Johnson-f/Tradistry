import React from 'react' 
import { Link } from 'react-router-dom'

export default function Landing() {
    return (
        <div>
            <h1 className='bg-gray-800'>Welcome to Journal Project</h1>
            <Link to="/Login.jsx">Login</Link> | <Link to="/SignUp.jsx">Sign Up</Link>
        </div>
    )
}

// This will have heavy customization & styling later on

// Backbone of the app 
// Will have to design it on Notion 