import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export default function Scene({ children }) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={groupRef}>
      {children}
    </group>
  )
}