import { useEffect, useRef, useState } from 'react'

const profileImages = [
  '/about/profile1.jpg',
  '/about/profile2.jpg',
  '/about/profile3.jpg',
  '/about/profile4.jpg',
  '/about/profile5.jpg',
]

export default function About() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Once-only visibility flip via IntersectionObserver (no scroll listener).
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])


  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index)
  }

  // Get 4 thumbnails excluding the currently selected image
  const getThumbnails = () => {
    const thumbnails = []
    for (let i = 0; i < profileImages.length; i++) {
      if (i !== selectedIndex) {
        thumbnails.push(i)
      }
    }
    return thumbnails.slice(0, 4)
  }

  return (
    <section
      ref={containerRef}
      className={`about-section ${isVisible ? 'visible' : ''}`}
      id="about"
    >
      <div className="about-container">
        <div className="about-content">
          <div className="about-image-wrapper">
            <div className="about-main-image">
            <img
                src={profileImages[selectedIndex]}
                alt={`Dongchan Kim ${selectedIndex + 1}`}
              className="about-profile-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                  target.src = `https://via.placeholder.com/600x600/0b0b0c/00aaff?text=Profile+${selectedIndex + 1}`
                }}
              />
            </div>
            <div className="about-thumbnails">
              {getThumbnails().map((index) => (
                <div
                  key={index}
                  className="about-thumbnail"
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={profileImages[index]}
                    alt={`Thumbnail ${index + 1}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://via.placeholder.com/150x150/0b0b0c/00aaff?text=Thumb+${index + 1}`
              }}
            />
                </div>
              ))}
            </div>
          </div>

          <div className="about-text-content">
            <p className="about-intro">
              Hello. I am a creative technologist building immersive systems at the boundary of XR, agents, and spatial computing.
            </p>
            
            <p className="about-description">
              I am a <span className="highlight">Senior Undergraduate</span> at{' '}
              <span className="highlight">Stony Brook University</span>. My experience spans across the domain of{' '}
              <span className="highlight">XR</span>, <span className="highlight">AI agents</span>,{' '}
              <span className="highlight">spatial computing</span>, and <span className="highlight">human-computer interaction</span>.
            </p>

            <p className="about-description">
              Throughout my endeavors, I continuously seek answers to these questions:{' '}
              <em>How can I create opportunities that allow people to achieve their full potential?{' '}
              And how can technology be a facilitator of human connections with each other and with the world around us?</em>
            </p>

            <p className="about-intro">
              I've been a dedicated fan of Manchester United for over 10 years and also root for the esports team HLE(Hanwha Life Esports).
              F1 racing is also my favorite sport, I love Max Verstappen and Red Bull Racing
            </p>

            <div className="about-contact">
              <a href="mailto:hello@example.com" className="about-link">Contact</a>
              {' | '}
              <a href="https://drive.google.com/file/d/1zU0mOuQvxPLiF_YwOE4YZobviriola0m/view?usp=sharing" className="about-link">Resume/CV</a>
              {' (available upon request)'}
            </div>

            <div className="about-social">
              <a
                href="https://github.com/dongckim"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="GitHub"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://dongckim.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Blog"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/dongckim99/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="LinkedIn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
