import React from 'react'
import { Home } from 'lucide-react'
import './Icon.scss'

const Icon: React.FC = async () => {
  return (
    <div className="admin-icon">
      <Home className="size-4 text-theme-text " />
    </div>
  )
}

export default Icon
