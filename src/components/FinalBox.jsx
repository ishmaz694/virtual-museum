import { Text } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'

export default function FinalBox({ onShowLetter }) {
  const { camera } = useThree()
  const keysPressed = useRef({})
  const playerPos = useRef(new THREE.Vector3(0, 1.6, 3))
  const boxProximityTime = useRef(null)
  const BOX_PROXIMITY = 2.5
  const BOX_OPEN_TIME = 1000

  useEffect(() => {
    camera.position.set(0, 1.6, 3)
    camera.lookAt(0, 1.6, 0)
    playerPos.current.set(0, 1.6, 3)
  }, [camera])

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true
    }
    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    const speed = 0.15
    const direction = new THREE.Vector3()
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)

    forward.y = 0
    right.y = 0
    forward.normalize()
    right.normalize()

    if (keysPressed.current['w']) direction.add(forward)
    if (keysPressed.current['s']) direction.sub(forward)
    if (keysPressed.current['a']) direction.sub(right)
    if (keysPressed.current['d']) direction.add(right)

    if (direction.length() > 0) {
      direction.normalize()
      
      const newPos = playerPos.current.clone()
      newPos.addScaledVector(direction, speed)

      const playerRadius = 0.5
      newPos.x = Math.max(-6.8 + playerRadius, Math.min(6.8 - playerRadius, newPos.x))
      newPos.z = Math.max(-6.5 + playerRadius, Math.min(3.5 - playerRadius, newPos.z))

      // Collisione con il pacco (non puoi entrare)
      const boxPos = [0, 1, -2]
      const boxRadius = 1.2
      const distToBox = Math.sqrt(
        Math.pow(newPos.x - boxPos[0], 2) +
        Math.pow(newPos.z - boxPos[2], 2)
      )
      
      if (distToBox < boxRadius) {
        // Non lasciare passare
      } else {
        playerPos.current.copy(newPos)
      }
    }

    camera.position.copy(playerPos.current)
    camera.position.y = 1.6

    // VERIFICA PROSSIMITÀ SCATOLA
    const currentTime = Date.now()
    const boxPosition = [0, 1, -2]
    const distance = Math.sqrt(
      Math.pow(playerPos.current.x - boxPosition[0], 2) +
      Math.pow(playerPos.current.z - boxPosition[2], 2)
    )

    if (distance < BOX_PROXIMITY) {
      if (!boxProximityTime.current) {
        boxProximityTime.current = currentTime
      }

      const timeNearBox = currentTime - boxProximityTime.current

      if (timeNearBox > BOX_OPEN_TIME) {
        console.log("Aprendo la lettera...")
        if (onShowLetter) {
          onShowLetter(true)
        } else {
          window.location.href = '/letter'
        }
      }
    } else {
      boxProximityTime.current = null
    }
  })

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!document.pointerLockElement) return

      const movementX = e.movementX || 0
      const movementY = e.movementY || 0

      const euler = new THREE.Euler(0, 0, 0, 'YXZ')
      euler.setFromQuaternion(camera.quaternion)

      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x - (movementY * 0.005)))
      euler.y -= movementX * 0.005

      camera.quaternion.setFromEuler(euler)
    }

    const onMouseDown = () => {
      document.body.requestPointerLock?.()
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [camera])

  return (
    <group>
      {/* PAVIMENTO - nero assoluto */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* SOFFITTO - nero */}
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* MURI - nero */}
      <mesh position={[-7, 1.75, 0]}>
        <boxGeometry args={[0.5, 3.5, 14]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      <mesh position={[7, 1.75, 0]}>
        <boxGeometry args={[0.5, 3.5, 14]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      <mesh position={[0, 1.75, -7]}>
        <boxGeometry args={[14, 3.5, 0.5]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      <mesh position={[0, 1.75, 6.8]}>
        <boxGeometry args={[14, 3.5, 0.5]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* LUCI SPOTLIGHT SUL REGALO */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, -2]} intensity={2} color="#ff1493" distance={15} />
      <pointLight position={[-3, 2, -2]} intensity={1} color="#ff1493" distance={10} />
      <pointLight position={[3, 2, -2]} intensity={1} color="#ff1493" distance={10} />

      {/* SCATOLA REGALO - ROSSO */}
      <mesh position={[0, 1, -2]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#cc0000"
          metalness={0.3}
        />
      </mesh>

      {/* NASTRO ORO ORIZZONTALE */}
      <mesh position={[0, 1, -0.95]}>
        <boxGeometry args={[2, 0.15, 0.1]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" />
      </mesh>

      {/* NASTRO ORO VERTICALE */}
      <mesh position={[0, 1, -0.95]}>
        <boxGeometry args={[0.15, 2.3, 0.1]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" />
      </mesh>

      {/* FIOCCO */}
      <mesh position={[0, 2.2, -0.8]}>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" />
      </mesh>

      {/* TESTO "APRIMI" */}
      <Text
        position={[0, 2.3, 1.5]}
        fontSize={0.4}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
      >
        Aprimi
      </Text>

      {/* ISTRUZIONI */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="#ff6b9d"
        anchorX="center"
      >
        Avvicinati al regalo...
      </Text>
    </group>
  )
}