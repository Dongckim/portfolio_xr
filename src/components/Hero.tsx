import { useState } from 'react'

interface HeroProps {
  scrollY: number
}

export default function Hero({ scrollY }: HeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  
  // Calculate opacity based on scroll position
  // Start fading earlier and faster to sync with cube animation
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const fadeStart = viewportHeight * 0.2  // Start earlier
  const fadeEnd = viewportHeight * 0.6    // Complete faster
  const scrollProgress = Math.max(0, Math.min(1, (scrollY - fadeStart) / (fadeEnd - fadeStart)))
  const opacity = 1 - scrollProgress

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <section className="hero" id="hero" style={{ opacity }}>
      {isHovering && (
        <div
          className="korean-name-tooltip"
          style={{
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y - 15}px`,
            opacity: opacity, // Tooltip also fades with hero
          }}
        >
          김동찬
        </div>
      )}
      <div className="text-area">
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
          <p>AR Developer @ <a href="" target="_blank" rel="noopener noreferrer">Immersyn</a></p>
          <p>VR Software Engineering Intern @ <a href="https://mingle-ai.com/en" target="_blank" rel="noopener noreferrer">KAI.Inc</a> (Jun 2025 - Sept 2025)</p> 
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
    </section>
  )
}

