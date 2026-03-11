'use client'

import { useEffect, useState } from 'react'
import { ScrollToTop } from './ScrollToTop'
import { WhatsappBubble } from './WhatsappBubble'

interface CornerToolsProps {
  whatsappNumber?: string | null
  showScrollToTop?: boolean
}

export function CornerTools({ whatsappNumber, showScrollToTop = true }: CornerToolsProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 transition-all duration-500`}
    >
      <WhatsappBubble phoneNumber={whatsappNumber} />
      {showScrollToTop && <ScrollToTop visible={visible} />}
    </div>
  )
}
