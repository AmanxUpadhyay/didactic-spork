import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

interface SprintResultsRevealProps {
  myScore: number
  partnerScore: number
  myName: string
  partnerName: string
  iWon: boolean
  isTie: boolean
  className?: string
}

export function SprintResultsReveal({
  myScore,
  partnerScore,
  myName,
  partnerName,
  iWon,
  isTie,
  className,
}: SprintResultsRevealProps) {
  const [phase, setPhase] = useState(0) // 0=hidden, 1=heading, 2=counting, 3=bars, 4=winner
  const [displayMyScore, setDisplayMyScore] = useState(0)
  const [displayPartnerScore, setDisplayPartnerScore] = useState(0)
  const rafRef = useRef<number>(0)

  // Staged animation
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100)
    const t2 = setTimeout(() => setPhase(2), 500)
    const t3 = setTimeout(() => setPhase(3), 1200)
    const t4 = setTimeout(() => setPhase(4), 1800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  // Score count-up animation
  useEffect(() => {
    if (phase < 2) return

    const duration = 700
    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      setDisplayMyScore(parseFloat((myScore * eased).toFixed(1)))
      setDisplayPartnerScore(parseFloat((partnerScore * eased).toFixed(1)))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, myScore, partnerScore])

  const winnerText = isTie
    ? "It's a tie! You both win!"
    : iWon
      ? 'You won this week!'
      : `${partnerName} won this week!`

  const winnerEmoji = isTie ? '🤝' : iWon ? '🏆' : '💪'

  const maxScore = Math.max(myScore, partnerScore, 1)

  return (
    <div className={cn('space-y-5', className)}>
      {/* Heading */}
      <h2
        className={cn(
          'font-heading text-xl font-bold text-text-primary text-center',
          'transition-all duration-500',
          phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}
      >
        Sprint Results
      </h2>

      {/* Score count-up */}
      <div
        className={cn(
          'flex items-center justify-around',
          'transition-all duration-500',
          phase >= 2 ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="text-center">
          <p className="text-sm text-text-secondary">{myName}</p>
          <p className="font-accent text-3xl font-bold text-primary tabular-nums">
            {displayMyScore.toFixed(1)}
          </p>
        </div>
        <span className="text-2xl text-text-secondary font-light">vs</span>
        <div className="text-center">
          <p className="text-sm text-text-secondary">{partnerName}</p>
          <p className="font-accent text-3xl font-bold text-secondary tabular-nums">
            {displayPartnerScore.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Comparison bars */}
      <div
        className={cn(
          'space-y-2',
          'transition-all duration-500',
          phase >= 3 ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="h-4 w-full rounded-[var(--radius-pill)] bg-border/30 overflow-hidden">
          <div
            className="h-full rounded-[var(--radius-pill)]"
            style={{
              width: phase >= 3 ? `${(myScore / maxScore) * 100}%` : '0%',
              background: 'linear-gradient(to right, var(--color-chart-a), var(--color-chart-b))',
              transition: 'width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </div>
        <div className="h-4 w-full rounded-[var(--radius-pill)] bg-border/30 overflow-hidden">
          <div
            className="h-full rounded-[var(--radius-pill)]"
            style={{
              width: phase >= 3 ? `${(partnerScore / maxScore) * 100}%` : '0%',
              background: 'linear-gradient(to right, var(--color-chart-b), var(--color-chart-a))',
              transition: 'width 600ms cubic-bezier(0.34, 1.56, 0.64, 1) 80ms',
            }}
          />
        </div>
      </div>

      {/* Winner announcement */}
      <div
        className={cn(
          'text-center py-3',
          'transition-all duration-500',
          phase >= 4
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-75',
        )}
      >
        <span className="text-3xl">{winnerEmoji}</span>
        <p className="font-heading text-lg font-bold text-primary mt-1">
          {winnerText}
        </p>
      </div>
    </div>
  )
}
