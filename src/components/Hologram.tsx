import { useEffect, useRef } from 'react'
import { input } from '../input'

export default function Hologram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const rotationRef = useRef({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let isMobile = window.innerWidth <= 768

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      isMobile = window.innerWidth <= 768
    }

    // Grid configuration - larger cells with more spacing
    const cellSize = 18
    const cols = Math.ceil(width / cellSize)
    const rows = Math.ceil(height / cellSize)

    let time = 0
    let smoothMouseX = width / 2
    let smoothMouseY = height / 2

    function drawGrid() {
      if (!ctx) return
      
      time += 0.004

      // Smooth mouse movement - always track current mouse position
      // This ensures lighting follows mouse even when scrolling
      const currentMouseX = input.mouse.x
      const currentMouseY = input.mouse.y
      
      // Always smoothly interpolate to current mouse position
      // This keeps lighting at mouse position even during scroll
      smoothMouseX += (currentMouseX - smoothMouseX) * 0.9
      smoothMouseY += (currentMouseY - smoothMouseY) * 0.9

      // 3D Rotating Cube - positioned on the right side, moves to center when scrolling to PortfolioMeaning
      // Hide cube entirely on mobile to reduce clutter
      const showCube = !isMobile
      
      // Calculate scroll progress for cube animation
      // Start animation immediately when scrolling starts (scrollY = 0)
      // Finish when About section first appears in viewport
      const cubeAnimationStart = 0  // Start immediately when scrolling begins
      const cubeAnimationEnd = window.innerHeight * 1.2   // Finish when About section first appears
      const scrollProgress = Math.max(0, Math.min(1, (input.scrollY - cubeAnimationStart) / (cubeAnimationEnd - cubeAnimationStart)))
      
      // Smooth easing function - more gentle for natural feel
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const easedProgress = easeInOutCubic(scrollProgress)
      
      // Cube position: right side (0.7) to center (0.5) when scrolling to About
      // On mobile, always center
      const cubeCenterX = isMobile ? width * 0.5 : width * (0.7 - easedProgress * 0.2)
      const cubeCenterY = height * 0.5
      
      // Cube size: 140 to 200 when scrolling
      // On mobile, use smaller fixed size
      const cubeSize = isMobile ? 70 : (140 + easedProgress * 60)

      // Continuous auto-rotation (always active)
      const autoRotSpeed = 1.0 // Speed of auto-rotation
      const deltaTime = 0.016 // Approximate frame time (60fps)
      rotationRef.current.x += autoRotSpeed * 0.5 * deltaTime
      rotationRef.current.y += autoRotSpeed * 0.7 * deltaTime
      rotationRef.current.z += autoRotSpeed * 0.3 * deltaTime

      // Mouse-based rotation (adds to auto-rotation)
      const normalizedMouseX = (smoothMouseX / width) * 2 - 1  // -1 to 1
      const normalizedMouseY = (smoothMouseY / height) * 2 - 1  // -1 to 1
      
      // Map mouse position to rotation angles
      // Mouse X controls Y-axis rotation (left-right)
      // Mouse Y controls X-axis rotation (up-down)
      // Z rotation is a combination for more dynamic effect
      const mouseRotY = normalizedMouseX * Math.PI * 0.8  // Y-axis rotation based on mouse X
      const mouseRotX = -normalizedMouseY * Math.PI * 0.8  // X-axis rotation based on mouse Y (inverted)
      const mouseRotZ = (normalizedMouseX + normalizedMouseY) * 0.3  // Z-axis rotation as combination
      
      // Combine auto-rotation with mouse rotation
      // Auto-rotation continues, mouse rotation adds on top smoothly
      const finalRotX = rotationRef.current.x + mouseRotX
      const finalRotY = rotationRef.current.y + mouseRotY
      const finalRotZ = rotationRef.current.z + mouseRotZ

      // Rotation matrices
      const cosX = Math.cos(finalRotX)
      const sinX = Math.sin(finalRotX)
      const cosY = Math.cos(finalRotY)
      const sinY = Math.sin(finalRotY)
      const cosZ = Math.cos(finalRotZ)
      const sinZ = Math.sin(finalRotZ)

      // Helper function to transform 3D point to 2D
      function transform3DTo2D(point3D: number[]): { x: number; y: number; z: number } {
        let [x, y, z] = point3D
        
        // Scale by cube size
        x *= cubeSize
        y *= cubeSize
        z *= cubeSize

        // Rotate around X axis
        const y1 = y * cosX - z * sinX
        const z1 = y * sinX + z * cosX
        y = y1
        z = z1

        // Rotate around Y axis
        const x1 = x * cosY + z * sinY
        const z2 = -x * sinY + z * cosY
        x = x1
        z = z2

        // Rotate around Z axis
        const x2 = x * cosZ - y * sinZ
        const y2 = x * sinZ + y * cosZ
        x = x2
        y = y2

        // Project to 2D (perspective projection)
        const perspective = 400 / (400 + z)
        const projX = cubeCenterX + x * perspective
        const projY = cubeCenterY + y * perspective

        return { x: projX, y: projY, z: z }
      }

      // Cube vertices in 3D space (8 vertices)
      const cubeVertices3D = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],  // Front face
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]        // Back face
      ]

      // Cube edges (vertex indices)
      const cubeEdges = [
        [0, 1], [1, 2], [2, 3], [3, 0],  // Front face
        [4, 5], [5, 6], [6, 7], [7, 4],  // Back face
        [0, 4], [1, 5], [2, 6], [3, 7]   // Connecting edges
      ]

      // Project all vertices to 2D
      const projectedVertices = cubeVertices3D.map(v => transform3DTo2D(v))

      // Distance to line segment function (for sharp edges)
      function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
        const dx = bx - ax
        const dy = by - ay
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        const projX = ax + t * dx
        const projY = ay + t * dy
        return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
      }

      ctx.font = `${cellSize * 0.9}px 'Courier New', monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Draw all cells, but brightness is determined by mouse and fluid light proximity
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellSize + cellSize / 2
          const y = row * cellSize + cellSize / 2

          // Distance to mouse (light source)
          const dxMouse = x - smoothMouseX
          const dyMouse = y - smoothMouseY
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)
          
          // Natural light gradient - inverse square law with smooth falloff
          const maxDistMouse = 800
          const normalizedDist = distMouse / maxDistMouse
          
          // Use inverse square law for realistic light falloff
          // Add smooth gradient transition instead of hard circular edge
          let mouseBrightness = 0
          if (normalizedDist < 1) {
            // Inverse square falloff for realistic light
            const invSquare = 1 / (1 + normalizedDist * normalizedDist * 2)
            // Smooth gradient with exponential decay
            mouseBrightness = invSquare * Math.exp(-normalizedDist * 8.5)
            // Soft edge transition
            mouseBrightness = Math.pow(mouseBrightness, 0.5)
          }

          // Cube light brightness - only on desktop (sharp wireframe using distance to edges)
          let fluidBrightness = 0
          if (showCube && projectedVertices.length > 0) {
            const lineThickness = 12 // Edge thickness in pixels
            
            // Calculate distance to nearest edge
            let minDistToEdge = Infinity
            for (const [a, b] of cubeEdges) {
              const p1 = projectedVertices[a]
              const p2 = projectedVertices[b]
              const dist = distToSegment(x, y, p1.x, p1.y, p2.x, p2.y)
              minDistToEdge = Math.min(minDistToEdge, dist)
            }
            
            // Calculate brightness based on distance to edge
            if (minDistToEdge < lineThickness) {
              fluidBrightness = 1 - (minDistToEdge / lineThickness)
              // Sharper falloff for crisp edges
              fluidBrightness = Math.pow(fluidBrightness, 1.5)
            }
          }

          // Combine mouse and fluid brightness
          const ambientBrightness = 0.03
          const finalBrightness = ambientBrightness + 
            mouseBrightness * 0.97 + 
            fluidBrightness * 0.85

          // Show all cells, but most will be very dark
          if (finalBrightness > 0.02) {
            // Determine character based on brightness: '1' (brightest), 'D', 'C', '0' (darkest)
            let char: '0' | '1' | 'D' | 'X' | 'C'
            if (finalBrightness > 0.5) {
              char = '1'
            }else{
              char = '0'
            }

            // Color based on mouse horizontal position
            // Left side (x = 0): Magenta (hue ~300)
            // Right side (x = width): Cyan (hue ~180)
            const normalizedX = Math.max(0, Math.min(1, smoothMouseX / width))
            const hue = 300 - normalizedX * 120 // 300 (magenta) to 180 (cyan)
            const saturation = 40 + finalBrightness * 60 // 40-100
            const lightness = 5 + finalBrightness * 65 // 5-70

            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`

            // Add glow for bright areas
            if (finalBrightness > 0.6) {
              ctx.shadowBlur = 10 * finalBrightness
              ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
            } else {
              ctx.shadowBlur = 0
            }

            ctx.fillText(char, x, y)
          }
        }
      }
    }

    let cleared = false

    function animate() {
      if (!ctx) return

      // Fade effect based on scroll - keep visible until after PortfolioMeaning section
      // PortfolioMeaning is at ~1 viewport height, so keep visible until ~2 viewport heights
      const fadeStart = window.innerHeight * 2
      const fadeEnd = window.innerHeight * 3
      const fadeProgress = Math.max(0, Math.min(1, (input.scrollY - fadeStart) / (fadeEnd - fadeStart)))
      const fadeOpacity = 1 - fadeProgress

      if (fadeOpacity <= 0) {
        // Fully faded out (user scrolled past). Skip the expensive per-cell
        // grid render; just clear the canvas once and idle.
        if (!cleared) {
          ctx.clearRect(0, 0, width, height)
          cleared = true
        }
      } else {
        cleared = false
        ctx.fillStyle = `rgba(11, 11, 12, ${0.3 + (1 - fadeOpacity) * 0.2})`
        ctx.fillRect(0, 0, width, height)

        ctx.globalAlpha = fadeOpacity
        drawGrid()
        ctx.globalAlpha = 1
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Pause the loop entirely when the tab is hidden.
    const handleVisibility = () => {
      if (document.hidden) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = undefined
        }
      } else if (animationFrameRef.current === undefined) {
        animate()
      }
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibility)
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="hologram-container">
      <canvas ref={canvasRef} className="hologram-canvas" />
    </div>
  )
}

