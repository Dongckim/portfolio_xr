import { useEffect, useRef, useState } from 'react'
import { input } from '../input'

export default function Hero() {
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const lastOpacityRef = useRef(1)

  // Drive opacity from scroll without re-rendering React. The opacity is
  // recomputed each frame and written directly to the DOM via refs.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const section = sectionRef.current
      if (!section) {
        raf = requestAnimationFrame(tick)
        return
      }
      const vh = window.innerHeight
      const fadeStart = vh * 0.2
      const fadeEnd = vh * 0.6
      const progress = Math.max(
        0,
        Math.min(1, (input.scrollY - fadeStart) / (fadeEnd - fadeStart))
      )
      const opacity = 1 - progress

      if (Math.abs(opacity - lastOpacityRef.current) > 0.005) {
        lastOpacityRef.current = opacity
        section.style.opacity = String(opacity)
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = String(opacity)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }

  return (
    <section ref={sectionRef} className="hero" id="hero" style={{ opacity: 1 }}>
      {isHovering && (
        <div
          ref={tooltipRef}
          className="korean-name-tooltip"
          style={{
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y - 15}px`,
          }}
        >
          김동찬
        </div>
      )}
      <div className="text-area">
        <a href="#projects" className="award-banner" aria-label="MIT Reality Hack 2026 — Grand Gold Award & Meta Track Winner">
          <span className="award-trophy" aria-hidden>🏆</span>
          <span className="award-text">
            <span className="award-event">MIT Reality Hack 2026</span>
            <span className="award-prize">Grand Gold Award · Meta Track Winner</span>
          </span>
          <span className="award-arrow" aria-hidden>→</span>
        </a>
        <h1
          className="name"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
        >
          Dongchan Kim (Alex) ᯅ
        </h1>
        <p className="tagline">
            Building immersive XR systems with a focus on spatial interaction and real-time UX.
        </p>
        <div className="description">
          <p>Senior AR Dev Mentor @ <a href="https://www.xreal.info/" target="_blank" rel="noopener noreferrer">XREAL</a></p>
          <p>AR Developer @ Immersyn (Folding Birding)</p>
          <p>VR Software Engineering Intern @ <a href="https://mingle-ai.com/en" target="_blank" rel="noopener noreferrer">KAI.Inc</a> (Jun 2025 - Sept 2025)</p>
        </div>
        <div className="featured-press">
          <span className="featured-label">Featured</span>
          <a href="https://developers.meta.com/blog/explore-whats-possible-with-wearables-device-access-toolkit/?utm_source=social-li&utm_medium=M4D&utm_campaign=organic&utm_content=wearables" target="_blank" rel="noopener noreferrer">Meta Developer Blog</a>
          <span className="featured-sep">·</span>
          <a href="https://www.awexr.com/blog/1288-road-to-awe-2026-i-spatial" target="_blank" rel="noopener noreferrer">AWE USA 2026</a>
        </div>
        <div className="studies-row">
          <span className="studies-label">Studies</span>
          <a href="https://dongckim.github.io/categories/#opengl" target="_blank" rel="noopener noreferrer" className="study-chip study-chip-primary">OpenGL</a>
          <a href="https://dongckim.github.io/categories/#unity" target="_blank" rel="noopener noreferrer" className="study-chip">Unity</a>
          <a href="https://dongckim.github.io/categories/#three-js" target="_blank" rel="noopener noreferrer" className="study-chip">Three.js</a>
          <a href="https://dongckim.github.io/categories/#systemdesign" target="_blank" rel="noopener noreferrer" className="study-chip">System Design</a>
        </div>
        <nav className="links">
          <a href="#projects">projects</a>
          <a href="#about">about</a>
          <a href="https://github.com/Dongckim" target="_blank" rel="noopener noreferrer">
            github
          </a>
          <a href="https://dongckim.github.io/" target="_blank" rel="noopener noreferrer">
            blog
          </a>
          <a href="https://www.linkedin.com/in/dongckim99/" target="_blank" rel="noopener noreferrer">
            linkedin
          </a>
          <a href="https://drive.google.com/file/d/1zU0mOuQvxPLiF_YwOE4YZobviriola0m/view?usp=sharing">CV</a>
        </nav>
      </div>
      <a href="#press" className="scroll-indicator" aria-label="Scroll down">
        <span className="scroll-indicator-label">scroll</span>
        <svg
          width="14"
          height="22"
          viewBox="0 0 14 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M7 1v18" />
          <path d="M1 13l6 6 6-6" />
        </svg>
      </a>
    </section>
  )
}
