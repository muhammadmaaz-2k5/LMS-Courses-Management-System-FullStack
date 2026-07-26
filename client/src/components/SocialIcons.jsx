import React from 'react'
import { Link } from 'react-router-dom'
import {
  GithubLogo,
  LinkedinLogo,
  EnvelopeSimple,
  Globe
} from 'phosphor-react'

const SocialIcons = () => {
  return (
    <div className='flex items-center gap-3 mt-5 ml-1 mb-2 max-md:mt-4'>
      <Link
        target='_blank'
        to='https://my-portfolio-topaz-seven-21.vercel.app/'
        className="group transition transform hover:scale-110 text-gray-500 hover:text-green-500"
      >
        <Globe size={34} weight="fill" className="transition-colors duration-300" />
      </Link>
      <Link
        target='_blank'
        to='https://www.linkedin.com/in/muhammad-maaz-a9277435b/'
        className="group transition transform hover:scale-110 text-[#0077b5] hover:text-green-600"
      >
        <LinkedinLogo size={34} weight="fill" className="transition-colors duration-300" />
      </Link>
      <Link
        target='_blank'
        to='https://github.com/muhammadmaaz-2k5'
        className="group transition transform hover:scale-110 text-[#333] hover:text-gray-700"
      >
        <GithubLogo size={34} weight="fill" className="transition-colors duration-300" />
      </Link>
      <Link
        target='_blank'
        to='mailto:muhamamdmaaz65@gmail.com'
        className="group transition transform hover:scale-110 text-[#ea4335] hover:text-green-500"
      >
        <EnvelopeSimple size={34} weight="fill" className="transition-colors duration-300" />
      </Link>
    </div>
  )
}

export default SocialIcons
