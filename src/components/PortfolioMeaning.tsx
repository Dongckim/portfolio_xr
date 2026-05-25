import { useEffect, useRef } from 'react'
import { input } from '../input'

export default function PortfolioMeaning() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let lastVisible: boolean | null = null

    const tick = () => {
      const text = textRef.current
      if (text) {
        const vh = window.innerHeight
        const start = vh * 0.2
        const end = vh * 0.8
        const progress = Math.max(
          0,
          Math.min(1, (input.scrollY - start) / (end - start))
        )
        const shouldShow = progress > 0.1
        if (shouldShow !== lastVisible) {
          lastVisible = shouldShow
          text.classList.toggle('visible', shouldShow)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section ref={sectionRef} className="portfolio-meaning-section">
      <div className="portfolio-meaning-content">
      <div ref={textRef} className="portfolio-meaning-text">
        <p className="meaning-line meaning-line-1">
        0s & 1s,
        </p>
        <p className="meaning-line meaning-line-1">
        form the foundation of every space I create,
        </p>
        <p className="meaning-line meaning-line-2">
          and light gives that space shape and intention.
        </p>
        <p className="meaning-line meaning-line-3">
          Through this digital interaction,
        </p>
        <p className="meaning-line meaning-line-4">
        I build environments that become meaningful,
        </p>
        <p className="meaning-line meaning-line-4">
        transformative spaces for the user.
        </p>
      </div>
      </div>
    </section>
  )
}
