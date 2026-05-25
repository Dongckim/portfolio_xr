import { useEffect, lazy, Suspense } from 'react'
import Hero from './components/Hero'
import Hologram from './components/Hologram'
import Projects from './components/Projects'
import About from './components/About'
import PortfolioMeaning from './components/PortfolioMeaning'
import Press from './components/Press'
import Footer from './components/Footer'
import BackgroundMusic from './components/BackgroundMusic'
import { initInput } from './input'

// Heavy, dependency-laden components (three.js / d3) are code-split so they
// stay out of the initial bundle and load on demand.
const WireframeSphere = lazy(() => import('./components/WireframeSphere'))
const MindMap = lazy(() => import('./components/MindMap'))

function App() {
  useEffect(() => {
    initInput()
  }, [])

  return (
    <>
      <BackgroundMusic videoId="YhX_Woa3kVA" volume={15} credit="F1 - Hans Zimmer" />
      <Suspense fallback={null}>
        <WireframeSphere />
      </Suspense>
      <Hologram />
      <Hero />
      <Press />
      <PortfolioMeaning />
      <About />
      <Projects />
      <Suspense fallback={null}>
        <MindMap />
      </Suspense>
      <Footer />
    </>
  )
}

export default App
