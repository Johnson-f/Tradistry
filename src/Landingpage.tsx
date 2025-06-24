import React from 'react' 
import { Link } from 'react-router-dom'

const Landing: React.FC = () => {
    return (
        <div>
            <h1 className='bg-gray-800'>Welcome to Journal Project</h1>
            <Link to="/Login">Login</Link> | <Link to="/SignUp">Sign Up</Link>
        </div>
    )
}

export default Landing;

// This will have heavy customization & styling later on

// Backbone of the app 
// Will have to design it on Notion 