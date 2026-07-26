
import React from 'react'
import { Link } from 'react-router-dom'
import SocialIcons from '../SocialIcons'

const Footer = () => {
  return (
    <footer className='flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 border-t'>
      <div className='flex items-center gap-4'>
        <h1 className='hidden md:block text-lg font-bold text-green-600 select-none'>Maaz LMS</h1>
        <div className='hidden md:block h-7 w-px bg-gray-500/60'></div>
        <p className='py-4 text-center text-xs md:text-sm text-gray-500'>
          Copyright 2025 © Maaz. All Right Reserved.
        </p>
      </div>

      <div className=''>
        <SocialIcons />
      </div>
    </footer>
  )
}

export default Footer
