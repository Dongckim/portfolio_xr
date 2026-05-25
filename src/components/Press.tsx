import { useEffect, useRef, useState } from 'react'

const photos = [
  '/realityhack/rh1.jpg',
  '/realityhack/rh2.jpg',
  '/realityhack/rh3.jpg',
  '/realityhack/rh4.jpg',
]

const articles = [
  {
    outlet: 'Stony Brook News',
    date: 'Apr 28, 2026',
    headline: 'Stony Brook Student Showcases AI Study Tool at MIT Reality Hack',
    href: 'https://news.stonybrook.edu/university/stony-brook-student-showcases-ai-study-tool-at-mit-reality-hack/',
  },
  {
    outlet: 'SUNY Korea',
    date: 'Feb 13, 2026',
    headline: 'SUNY Korea Student Wins Final Grand Prize at MIT Reality Hack 2026',
    href: 'https://sunykorea.ac.kr/news/html/sub04/04.html?mode=V&mng_no=1321&category=Students',
  },
]

export default function Press() {
  const [activePhoto, setActivePhoto] = useState(0)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible(true)
        })
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleProjectJump = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = document.getElementById('projects')
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      ref={sectionRef}
      className={`press-section ${visible ? 'visible' : ''}`}
      id="press"
    >
      <div className="press-container">
        <div className="press-eyebrow-row">
          <span className="press-eyebrow">Press · Recognition</span>
          <span className="press-badge">🏆 Grand Gold Award | 최종우승 대상 수상</span>
        </div>

        <h2 className="press-headline">
          MIT Reality Hack <span className="press-headline-accent">2026</span>
        </h2>
        <p className="press-subhead">
          Grand Gold Award &nbsp;·&nbsp; Meta Track Winner &nbsp;·&nbsp; SmartSight
        </p>

        <div className="press-grid">
          <div className="press-visual">
            <div className="press-hero-photo">
              <img
                src={photos[activePhoto]}
                alt={`MIT Reality Hack 2026 — photo ${activePhoto + 1}`}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="press-thumbs">
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  className={`press-thumb ${i === activePhoto ? 'active' : ''}`}
                  onClick={() => setActivePhoto(i)}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>

          <div className="press-text">
            <blockquote className="press-quote">
              <p>
                “XR shouldn't replace your world — it should teach technology to
                finally see the one you're already in.”
              </p>
              <cite>— Dongchan Kim</cite>
            </blockquote>

            <div className="press-articles-header">
              <span className="press-articles-label">News Coverage</span>
              <span className="press-articles-count">{articles.length} articles</span>
            </div>
            <ul className="press-articles" aria-label="News articles covering the project">
              {articles.map((a) => (
                <li key={a.href} className="press-article">
                  <a
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press-article-link"
                  >
                    <div className="press-article-meta">
                      <span className="press-news-tag" aria-label="News article">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                          <path d="M18 14h-8" />
                          <path d="M15 18h-5" />
                          <path d="M10 6h8v4h-8V6Z" />
                        </svg>
                        News Article
                      </span>
                      <span className="press-dot" aria-hidden>·</span>
                      <span className="press-outlet">{a.outlet}</span>
                      <span className="press-dot" aria-hidden>·</span>
                      <span className="press-date">{a.date}</span>
                    </div>
                    <p className="press-article-headline">{a.headline}</p>
                    <span className="press-article-arrow" aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#projects"
              onClick={handleProjectJump}
              className="press-cta"
            >
              <span className="press-cta-label">Read the case study</span>
              <span className="press-cta-sub">SmartSight · Extended Reality</span>
              <span className="press-cta-arrow" aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
