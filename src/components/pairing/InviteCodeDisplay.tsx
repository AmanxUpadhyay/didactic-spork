import { useState } from 'react'
import { Card, Button } from '@/components/ui'

interface InviteCodeDisplayProps {
  code: string
}

export function InviteCodeDisplay({ code }: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="text-center space-y-4">
      <p className="text-sm text-text-secondary">Share this code with your partner</p>
      <div className="flex justify-center gap-2">
        {code.split('').map((char, i) => (
          <span
            key={i}
            className="w-12 h-14 flex items-center justify-center rounded-[var(--radius-input)] border-2 border-primary bg-primary/5 font-accent text-2xl font-bold text-primary"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {char}
          </span>
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
      >
        {copied ? 'Copied!' : 'Copy Code'}
      </Button>
      <p className="text-xs text-text-secondary">Code expires in 24 hours</p>
    </Card>
  )
}
