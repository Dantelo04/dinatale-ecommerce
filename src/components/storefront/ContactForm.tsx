'use client'

import React, { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface ContactFormProps {
  whatsappNumber: string
}

export function ContactForm({ whatsappNumber }: ContactFormProps) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = `Hola! Mi nombre es ${name}.\n\n${message}`
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="contact-name" className="text-sm font-medium">
          Nombre
        </label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Tu nombre…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-medium">
          Mensaje
        </label>
        <Textarea
          id="contact-message"
          name="message"
          required
          placeholder="Escribi tu consulta…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1"
        />
      </div>
      <Button
        type="submit"
        className="bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
        Enviar por WhatsApp
      </Button>
    </form>
  )
}
