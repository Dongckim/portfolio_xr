// Module-level input store. Avoids React state for high-frequency input
// (mousemove / scroll) so consumers don't trigger a re-render storm.
// Components that need to react visually subscribe via their own rAF loops
// and read directly from this object.

export const input = {
  mouse: {
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  },
  scrollY: 0,
}

let initialized = false

export function initInput() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  input.scrollY = window.scrollY

  // Direct ref writes — no React, no rAF coalescing needed because
  // consumers only read inside their own rAF loops.
  window.addEventListener(
    'mousemove',
    (e) => {
      input.mouse.x = e.clientX
      input.mouse.y = e.clientY
    },
    { passive: true }
  )
  window.addEventListener(
    'scroll',
    () => {
      input.scrollY = window.scrollY
    },
    { passive: true }
  )
}
