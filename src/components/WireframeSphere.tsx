import { useEffect, useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { input } from '../input'

function Sphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const baseRotationY = useRef(0)
  const baseRotationX = useRef(0)

  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(5.1, 16, 16)
  }, [])

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return

    baseRotationY.current += 0.003
    baseRotationX.current += 0.002

    const scrollY = input.scrollY
    meshRef.current.rotation.y = baseRotationY.current + scrollY * 0.0005
    meshRef.current.rotation.x = baseRotationX.current + scrollY * 0.0003

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
    meshRef.current.scale.setScalar(pulse)

    const scrollBoost = Math.min(scrollY / 100, 1)
    const baseOpacity = 1.0 + scrollBoost * 0.45

    const normalizedX = (input.mouse.x / window.innerWidth) * 2 - 1
    const normalizedY = -(input.mouse.y / window.innerHeight) * 2 + 1
    const mouseDistance = Math.sqrt(
      normalizedX * normalizedX + normalizedY * normalizedY
    )
    const brightness = Math.max(0, 1 - mouseDistance / 1.5)

    const hue = 200 + brightness * 30
    const saturation = 80
    const lightness = 50 + brightness * 20
    materialRef.current.color.setHSL(
      hue / 360,
      saturation / 100,
      lightness / 100
    )
    materialRef.current.opacity = baseOpacity + brightness * 0.2
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial
        ref={materialRef}
        wireframe
        transparent
        color="#0055ff"
      />
    </mesh>
  )
}

function WireframeSphere() {
  // Pause the render loop entirely when the tab is hidden so the GPU isn't
  // burning power redrawing a sphere nobody is looking at.
  const [paused, setPaused] = useState(
    typeof document !== 'undefined' && document.hidden
  )

  useEffect(() => {
    const onVis = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <div className="r3f-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
        frameloop={paused ? 'never' : 'always'}
      >
        <Sphere />
      </Canvas>
    </div>
  )
}

export default WireframeSphere
