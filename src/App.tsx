import { useState, useEffect } from 'react'
import Hero from './components/Hero'
import Hologram from './components/Hologram'
import MindMap from './components/MindMap'
import WireframeSphere from './components/WireframeSphere'
import Projects from './components/Projects'
import About from './components/About'
import PortfolioMeaning from './components/PortfolioMeaning'
import Footer from './components/Footer'
import BackgroundMusic from './components/BackgroundMusic'

function App() {
  const [mousePosition, setMousePosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Initialize mouse position to center
    setMousePosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <BackgroundMusic videoId="YhX_Woa3kVA" volume={15} credit="F1 - Hans Zimmer" />
      <WireframeSphere mousePosition={mousePosition} scrollY={scrollY} />
      <Hologram mousePosition={mousePosition} scrollY={scrollY} />
      <Hero scrollY={scrollY} />
      <PortfolioMeaning mousePosition={mousePosition} scrollY={scrollY} />
      <About />
      <MindMap />
      <Projects />
      <Footer />
    </>
  )
}

export default App

