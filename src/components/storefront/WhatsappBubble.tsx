'use client'

import React from 'react'
import { FaWhatsapp } from "react-icons/fa";

interface WhatsappBubbleProps {
  phoneNumber?: string | null
}

function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '')
}

export function WhatsappBubble({ phoneNumber }: WhatsappBubbleProps) {
  if (!phoneNumber) return null

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)
  if (!normalizedPhoneNumber) return null

  const message = 'Hola! Quiero consultar por sus productos.'
  const href = `https://wa.me/${normalizedPhoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="flex size-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all duration-500 hover:bg-green-700 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <FaWhatsapp className="size-8" />
    </a>
  )
}