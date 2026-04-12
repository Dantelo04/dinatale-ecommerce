import React from 'react'

import './GoToOrdersButton.scss'

const GoToOrdersButton: React.FC = () => {
  return (
    <div className="go-to-orders">
      <a href="/ordenes" target="_blank" rel="noopener noreferrer" className="go-to-orders__button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="13" y2="16" />
        </svg>
        Gestionar Pedidos
      </a>
    </div>
  )
}

export default GoToOrdersButton
