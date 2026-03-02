import { useEffect, useRef, useState } from 'react'
import { m, useAnimate, stagger } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Exchange01Icon, Award01Icon, BodyPartMuscleIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/cn'
import { kawaiiSpring, useCelebration } from '@/lib/animations'
import { MochiAvatar } from '@/components/ui/MochiAvatar'

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
  const [scope, animate] = useAnimate()
  const { celebrate } = useCelebration()
  const [displayMyScore, setDisplayMyScore] = useState(0)
  const [displayPartnerScore, setDisplayPartnerScore] = useState(0)
  const rafRef = useRef<number>(0)
  const hasRun = useRef(false)

  const winnerText = isTie
    ? "It's a tie! You both win!"
    : iWon
      ? 'You won this week!'
      : `${partnerName} won this week!`

  const winnerIcon = isTie
    ? <HugeiconsIcon icon={Exchange01Icon} size={40} />
    : iWon
      ? <HugeiconsIcon icon={Award01Icon} size={40} />
      : <HugeiconsIcon icon={BodyPartMuscleIcon} size={40} />
  const maxScore = Math.max(myScore, partnerScore, 1)

  // Score count-up animation
  function startCountUp() {
    const duration = 700
    const startTime = performance.now()
    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayMyScore(parseFloat((myScore * eased).toFixed(1)))
      setDisplayPartnerScore(parseFloat((partnerScore * eased).toFixed(1)))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function revealSequence() {
      if (!scope.current) return

      // Step 1: Heading fades in
      await animate('[data-heading]',
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
      )

      await new Promise<void>(r => setTimeout(r, 200))

      // Step 2: Scores count up
      await animate('[data-scores]', { opacity: [0, 1] }, { duration: 0.3 })
      startCountUp()
      await new Promise<void>(r => setTimeout(r, 800))

      // Step 3: Score bars fill with overshoot
      await animate('[data-score-bar]',
        { scaleX: [0, 1.04, 1], opacity: [0, 1] },
        { duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: stagger(0.1) },
      )

      // Step 4: Winner bar glow pulse
      const winnerBarKey = iWon ? '[data-my-bar]' : '[data-partner-bar]'
      if (!isTie) {
        await animate(winnerBarKey,
          { boxShadow: [
            '0 0 0px 0px var(--color-primary)',
            '0 0 20px 8px color-mix(in srgb, var(--color-primary) 60%, transparent)',
            '0 0 8px 2px color-mix(in srgb, var(--color-primary) 30%, transparent)',
          ] },
          { duration: 0.8 },
        )
      }

      // Step 5: Winner text scales in
      await animate('[data-winner-text]',
        { scale: [0, 1.15, 1], opacity: [0, 1] },
        { ...kawaiiSpring },
      )

      // Step 6: Confetti
      celebrate('large')

      // Step 7: Mochi appears
      await new Promise<void>(r => setTimeout(r, 300))
      await animate('[data-mochi]',
        { opacity: [0, 1], y: [20, 0] },
        { ...kawaiiSpring },
      )
    }

    revealSequence()

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={scope} className={cn('space-y-5', className)}>
      {/* Heading */}
      <m.h2
        data-heading
        className="font-heading text-xl font-bold text-text-primary text-center"
        initial={{ opacity: 0, y: 16 }}
      >
        Sprint Results
      </m.h2>

      {/* Score count-up */}
      <m.div
        data-scores
        className="flex items-center justify-around"
        initial={{ opacity: 0 }}
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
      </m.div>

      {/* Comparison bars */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded-[var(--radius-pill)] bg-border/30 overflow-hidden">
          <m.div
            data-score-bar
            data-my-bar
            className="h-full rounded-[var(--radius-pill)] origin-left"
            style={{
              width: `${(myScore / maxScore) * 100}%`,
              background: 'linear-gradient(to right, var(--color-chart-a), var(--color-chart-b))',
              transformOrigin: 'left',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
          />
        </div>
        <div className="h-4 w-full rounded-[var(--radius-pill)] bg-border/30 overflow-hidden">
          <m.div
            data-score-bar
            data-partner-bar
            className="h-full rounded-[var(--radius-pill)] origin-left"
            style={{
              width: `${(partnerScore / maxScore) * 100}%`,
              background: 'linear-gradient(to right, var(--color-chart-b), var(--color-chart-a))',
              transformOrigin: 'left',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
          />
        </div>
      </div>

      {/* Winner announcement */}
      <m.div
        data-winner-text
        className="text-center py-3"
        initial={{ opacity: 0, scale: 0 }}
      >
        <span className="flex justify-center text-primary">{winnerIcon}</span>
        <p className="font-heading text-lg font-bold text-primary mt-1">
          {winnerText}
        </p>
      </m.div>

      {/* Mochi reveal */}
      <m.div
        data-mochi
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
      >
        <MochiAvatar
          expression={iWon || isTie ? 'celebrate' : 'sparkle'}
          size="md"
          enablePetting
        />
      </m.div>
    </div>
  )
}
