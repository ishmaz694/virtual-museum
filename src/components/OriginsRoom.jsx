import { Text } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'


export default function OriginsRoom({ onExitRoom }) {
  const { camera } = useThree()
  const keysPressed = useRef({})
  const playerPos = useRef(new THREE.Vector3(0, 1.6, 4))
  const doorStayTime = useRef({})
  const DOOR_PROXIMITY = 2
  const DOOR_STAY_TIME = 2000

  // Posiziona la camera quando entri nella stanza
  useEffect(() => {
    camera.position.set(0, 1.6, 4)
    camera.lookAt(0, 1.6, 0)
    playerPos.current.set(0, 1.6, 4)
  }, [camera])

  // Gestione tasti
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

  // Movement loop
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

      // Collisioni stanza
      const playerRadius = 0.3
      newPos.x = Math.max(-6.8 + playerRadius, Math.min(6.8 - playerRadius, newPos.x))
      newPos.z = Math.max(-6.5 + playerRadius, Math.min(6.8 - playerRadius, newPos.z))

      playerPos.current.copy(newPos)
    }

    // Sincronizza camera con playerPos
    camera.position.copy(playerPos.current)
    camera.position.y = 1.6

    // VERIFICA PROSSIMITÀ PORTA PER TORNARE
    const currentTime = Date.now()
    const doorPosition = [0, 0.8, 6.3]
    const distance = Math.sqrt(
      Math.pow(playerPos.current.x - doorPosition[0], 2) +
      Math.pow(playerPos.current.z - doorPosition[2], 2)
    )

    if (distance < DOOR_PROXIMITY) {
      if (!doorStayTime.current['exit']) {
        doorStayTime.current['exit'] = currentTime
      }

      const timeNearDoor = currentTime - doorStayTime.current['exit']

      if (timeNearDoor > DOOR_STAY_TIME) {
        onExitRoom?.()
      }
    } else {
      doorStayTime.current = {}
    }
  })

  // Mouse look
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

  // Genera stelle casuali
  const stars = Array.from({ length: 200 }, () => ({
    x: (Math.random() - 0.5) * 30,
    y: (Math.random() - 0.5) * 30,
    z: (Math.random() - 0.5) * 30,
    size: Math.random() * 0.15 + 0.05,
  }))

  return (
    <group>
      {/* PAVIMENTO - blu scuro notte */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0a0f1e" />
      </mesh>

      {/* SOFFITTO - cielo notturno */}
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0d1428" />
      </mesh>

      {/* MURO SINISTRO - blu scuro */}
      <mesh position={[-7, 1.75, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 3.5]} />
        <meshStandardMaterial color="#0f1a2e" />
      </mesh>



      {/* MURO DESTRO - blu scuro */}
      <mesh position={[7, 1.75, -1]}>
        <boxGeometry args={[0.5, 3.5, 14]} />
        <meshStandardMaterial color="#0f1a2e" />
      </mesh>

      {/* MURO PORTA - blu scuro */}
      <mesh position={[0, 1.75, 5.8]}>
        <boxGeometry args={[14, 3.5, 0.5]} />
        <meshStandardMaterial color="#0f1a2e" />
      </mesh>

    <mesh position={[0, 1.75, -6.8]}>
        <boxGeometry args={[15, 4.2, 0.1]} />
        <meshStandardMaterial 
          map={new THREE.TextureLoader().load('images/stmariafiorenotte.jpg')}
        />
      </mesh>

      {/* Cornice quadro - sottile */}
      <mesh position={[0, 1.75, -6.87]}>
        <boxGeometry args={[14.2, 3.7, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* PORTA PER TORNARE AL CORRIDOIO */}
      <group position={[0, 0.8, 5.3]} rotation={[0, Math.PI, 0]}>
        {/* Cornice porta */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[2.2, 2.8, 0.12]} />
          <meshStandardMaterial 
            color="#ff6b9d"
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>

        {/* Porta */}
        <mesh position={[0, 0, 0.15]}>
          <boxGeometry args={[2, 2.6, 0.1]} />
          <meshStandardMaterial color="#0a0e1a" />
        </mesh>

        {/* Maniglia */}
        <mesh position={[0.85, 0, 0.25]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>

      {/* LUCI */}
      <ambientLight intensity={2} color="#ffffff" />
      <pointLight position={[0, 3.3, 0]} intensity={5} color="#6a8fff" distance={25} />
      <pointLight position={[-5, 2.5, -3]} intensity={2.8} color="#6a8fff" distance={15} />
      <pointLight position={[5, 2.5, -3]} intensity={2.8} color="#6a8fff" distance={15} />
      <pointLight position={[0, 1, 6]} intensity={2.7} color="#6a8fff" distance={15} />

      <Text
        position={[0, 0.1, -4.6]}
        rotation={[-1, 0, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        fontWeight="bold"
      >
        Una sera che ha cambiato tutto
      </Text>
    </group>
  )
}