import { useSpring } from 'motion/react'
import { kawaiiSpring } from '../config'

export function useKawaiiSpring(initialValue: number) {
  return useSpring(initialValue, kawaiiSpring)
}
