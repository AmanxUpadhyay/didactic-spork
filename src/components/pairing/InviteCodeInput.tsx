import { useState, useRef, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui'

interface InviteCodeInputProps {
  onSubmit: (code: string) => void
  loading?: boolean
  error?: string
}

export function InviteCodeInput({ onSubmit, loading, error }: InviteCodeInputProps) {
  const [chars, setChars] = useState<string[]>(Array(6).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(index: number, value: string) {
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1)
    const next = [...chars]
    next[index] = char
    setChars(next)

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    const next = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setChars(next)
    if (pasted.length >= 6) {
      inputRefs.current[5]?.focus()
    } else {
      inputRefs.current[pasted.length]?.focus()
    }
  }

  const code = chars.join('')
  const isComplete = code.length === 6

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {chars.map((char, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="text"
            maxLength={1}
            value={char}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center rounded-[var(--radius-input)] border-2 border-border bg-surface font-accent text-2xl font-bold text-text-primary outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:shadow-[var(--shadow-focus)]"
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-error text-center animate-[head-shake_400ms_ease]">{error}</p>
      )}
      <Button
        className="w-full"
        disabled={!isComplete || loading}
        onClick={() => onSubmit(code)}
      >
        {loading ? 'Joining...' : 'Join Partner'}
      </Button>
    </div>
  )
}
