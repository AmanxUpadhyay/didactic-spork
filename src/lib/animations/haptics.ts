export const haptics = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(25),
  success: () => navigator.vibrate?.([10, 30, 10, 30, 50]),
  celebration: () => navigator.vibrate?.([10, 20, 10, 20, 10, 20, 50]),
  error: () => navigator.vibrate?.([50, 20, 50]),
}
