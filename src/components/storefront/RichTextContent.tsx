import React from 'react'

interface RichTextContentProps {
  content: Record<string, unknown> | null | undefined
}

interface LexicalNode {
  type: string
  tag?: string
  children?: LexicalNode[]
  text?: string
  format?: number
  url?: string
  listType?: string
  value?: number
  direction?: string | null
  indent?: number
  version?: number
}

function renderNode(node: LexicalNode, index: number): React.ReactNode {
  if (node.type === 'text') {
    let text: React.ReactNode = node.text || ''
    if (node.format && typeof node.format === 'number') {
      if (node.format & 1) text = <strong key={index}>{text}</strong>
      if (node.format & 2) text = <em key={index}>{text}</em>
      if (node.format & 8) text = <u key={index}>{text}</u>
      if (node.format & 4) text = <s key={index}>{text}</s>
      if (node.format & 16) text = <code key={index}>{text}</code>
    }
    return <React.Fragment key={index}>{text}</React.Fragment>
  }

  const children = node.children?.map((child, i) => renderNode(child, i)) || null

  switch (node.type) {
    case 'paragraph':
      return <p key={index}>{children}</p>
    case 'heading': {
      const tag = node.tag || 'h2'
      if (tag === 'h1') return <h1 key={index}>{children}</h1>
      if (tag === 'h3') return <h3 key={index}>{children}</h3>
      if (tag === 'h4') return <h4 key={index}>{children}</h4>
      if (tag === 'h5') return <h5 key={index}>{children}</h5>
      if (tag === 'h6') return <h6 key={index}>{children}</h6>
      return <h2 key={index}>{children}</h2>
    }
    case 'list':
      return node.listType === 'number' ? (
        <ol key={index}>{children}</ol>
      ) : (
        <ul key={index}>{children}</ul>
      )
    case 'listitem':
      return <li key={index}>{children}</li>
    case 'link':
    case 'autolink':
      return (
        <a key={index} href={node.url || '#'} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    case 'quote':
      return <blockquote key={index}>{children}</blockquote>
    case 'linebreak':
      return <br key={index} />
    default:
      return children ? <React.Fragment key={index}>{children}</React.Fragment> : null
  }
}

export function RichTextContent({ content }: RichTextContentProps) {
  if (!content || !content.root) return null

  const root = content.root as LexicalNode
  if (!root.children?.length) return null

  return <>{root.children.map((node, i) => renderNode(node, i))}</>
}
