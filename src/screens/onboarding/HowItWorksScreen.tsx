import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { kawaiiSpring } from '@/lib/animations'

interface HowItWorksScreenProps {
  onNext: () => void
  onSkip: () => void
}

const CARDS = [
  {
    image: '/image/mochi-curious.png',
    title: 'Track your habits',
    subtitle: 'Check off daily. Build streaks. Beat yesterday.',
  },
  {
    image: '/image/mochi-happy-bounce.png',
    title: 'Compete weekly',
    subtitle: 'Loser plans a punishment date. Stakes make it real.',
  },
  {
    image: '/image/mochi-celebrate.png',
    title: 'Kira judges it all',
    subtitle: 'Fair, funny, occasionally savage.',
  },
]

export function HowItWorksScreen({ onNext, onSkip }: HowItWorksScreenProps) {
  const [cardIndex, setCardIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const goTo = (idx: number) => {
    setDirection(idx > cardIndex ? 'forward' : 'back')
    setCardIndex(idx)
  }

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -50 && cardIndex < CARDS.length - 1) {
      setDirection('forward')
      setCardIndex((i) => i + 1)
    } else if (info.offset.x > 50 && cardIndex > 0) {
      setDirection('back')
      setCardIndex((i) => i - 1)
    }
  }

  const card = CARDS[cardIndex]!


  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-10">
      {/* Skip */}
      <div className="flex justify-end mb-4">
        <button className="text-sm text-text-secondary" onClick={onSkip}>
          Skip
        </button>
      </div>

      {/* Swipeable card */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <m.div
            key={cardIndex}
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            variants={{
              hidden: (dir: 'forward' | 'back') => ({
                opacity: 0,
                x: dir === 'forward' ? 80 : -80,
              }),
              visible: {
                opacity: 1,
                x: 0,
                transition: kawaiiSpring,
              },
              exit: (dir: 'forward' | 'back') => ({
                opacity: 0,
                x: dir === 'forward' ? -80 : 80,
                transition: { duration: 0.18 },
              }),
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center text-center gap-6 max-w-xs w-full select-none cursor-grab active:cursor-grabbing"
          >
            <m.img
              src={card.image}
              alt={card.title}
              className="w-40 h-40 object-contain motion-safe:animate-[float_3s_ease-in-out_infinite]"
            />
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold text-text-primary">{card.title}</h2>
              <p className="text-base text-text-secondary leading-body">{card.subtitle}</p>
            </div>
          </m.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mb-8">
        {CARDS.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className="p-1" aria-label={`Slide ${i + 1}`}>
            <m.div
              className="h-2 rounded-full bg-primary"
              animate={{
                width: i === cardIndex ? 20 : 8,
                opacity: i === cardIndex ? 1 : 0.3,
              }}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            />
          </button>
        ))}
      </div>

      {/* CTA */}
      {cardIndex === CARDS.length - 1 ? (
        <Button size="lg" className="w-full" onClick={onNext}>
          Got it
        </Button>
      ) : (
        <Button size="lg" variant="ghost" className="w-full" onClick={() => goTo(cardIndex + 1)}>
          Next
        </Button>
      )}
    </div>
  )
}
