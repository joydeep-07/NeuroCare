import React from 'react'
import ThemeToggle from '../components/ThemeToggle'

const Navbar = () => {
  return (
    <nav className='border border-[var(--border-light)] h-10'>
<ThemeToggle/>
    </nav>
  )
}

export default Navbar