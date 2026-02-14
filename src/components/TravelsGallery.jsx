import { Text } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'

// Quadri sulla parete SINISTRA
const PAINTINGS_LEFT = [
  { position: [-6.5, 2, -4.5], title: 'Tokyo', imageUrl: 'images/tokyo.jpg' },
  { position: [-6.5, 2, -1.5], title: 'NYC', imageUrl: 'images/ny.jpg' },
  { position: [-6.5, 2, 1.5], title: 'Aurora Boreale', imageUrl: 'images/auroraboreale.jpg' },
]

// Quadri sulla parete DESTRA
const PAINTINGS_RIGHT = [
  { position: [6.5, 2, -4.5], title: 'Sardegna', imageUrl: 'images/sardegna.jpg' },
  { position: [6.5, 2, -1.5], title: 'Cina', imageUrl: 'images/cina.jpg' },
  { position: [6.5, 2, 1.5], title: 'Bali', imageUrl: 'images/bali.jpg' },
]

// Quadro grande sulla parete di fondo
const BIG_PAINTING = [
  { position: [0, 1.75, -6.8], title: 'Colombia', imageUrl: 'images/bogota.jpg' }
]

function Painting({ position, rotation, title, idx, imageUrl, scale = 1 }) {
  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Cornice */}
      <mesh position={[0, 0, 0.02]} scale={[scale, scale, 1]}>
        <boxGeometry args={[2.5, 1.7, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Tela */}
      <mesh position={[0, 0, 0.05]} scale={[scale, scale, 1]}>
        <boxGeometry args={[2.3, 1.5, 0.06]} />
        {imageUrl ? (
          <meshStandardMaterial map={new THREE.TextureLoader().load(imageUrl)} />
        ) : (
          <meshStandardMaterial 
            color={`hsl(${idx * 90}, 65%, 45%)`}
            emissive={`hsl(${idx * 90}, 65%, 25%)`}
          />
        )}
      </mesh>

      {/* Titolo */}
      <Text
        position={[0, -1.3 * scale, 0.08]}
        fontSize={0.25}
        color="black"
        anchorX="center"
      >
        {title}
      </Text>
    </group>
  )
}

export default function TravelsGallery({ onExitRoom }) {
  const { camera } = useThree()
  const keysPressed = useRef({})
  const playerPos = useRef(new THREE.Vector3(0, 1.6, 2))
  const doorStayTime = useRef({})
  const DOOR_PROXIMITY = 2
  const DOOR_STAY_TIME = 2000

  // Posiziona la camera quando entri nella stanza
  useEffect(() => {
    camera.position.set(0, 1.6, 2)
    camera.lookAt(0, 1.6, 0)
    playerPos.current.set(0, 1.6, 2)
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

  return (
    <group>
      {/* PAVIMENTO - colore caldo beige */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#f5e6d3" />
      </mesh>

      {/* SOFFITTO - colore caldo */}
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#faf4ed" />
      </mesh>

      {/* MURO SINISTRO */}
      <mesh position={[-7, 1.75, 0]}>
        <boxGeometry args={[0.5, 3.5, 14]} />
        <meshStandardMaterial color="#e8d4c4" />
      </mesh>

      {/* MURO DESTRO */}
      <mesh position={[7, 1.75, 0]}>
        <boxGeometry args={[0.5, 3.5, 14]} />
        <meshStandardMaterial color="#e8d4c4" />
      </mesh>

      {/* MURO FONDO */}
      <mesh position={[0, 1.75, -7]}>
        <boxGeometry args={[14, 3.5, 0.5]} />
        <meshStandardMaterial color="#e8d4c4" />
      </mesh>

      {/* MURO PORTA */}
      <mesh position={[0, 1.75, 6.8]}>
        <boxGeometry args={[14, 3.5, 0.5]} />
        <meshStandardMaterial color="#e8d4c4" />
      </mesh>

      {/* PORTA PER TORNARE AL CORRIDOIO */}
      <group position={[0, 0.8, 6.3]} rotation={[0, Math.PI, 0]}>
        {/* Cornice porta */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[2.2, 2.8, 0.12]} />
          <meshStandardMaterial 
            color="#4ecdc4"
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

      {/* LUCI CALDE */}
      <ambientLight intensity={1} color="#ffa500" />
      <pointLight position={[0, 3.3, 0]} intensity={1.5} color="#ffb84d" distance={25} />
      <pointLight position={[-5, 2.5, 0]} intensity={1} color="#ffb84d" distance={15} />
      <pointLight position={[5, 2.5, 0]} intensity={1} color="#ffb84d" distance={15} />


      {/* QUADRI PARETE SINISTRA */}
      {PAINTINGS_LEFT.map((painting, idx) => (
        <Painting 
          key={`left-${idx}`}
          position={painting.position} 
          rotation={[0, Math.PI / 2, 0]}
          title={painting.title}
          idx={idx}
          imageUrl={painting.imageUrl}
        />
      ))}

      {/* QUADRI PARETE DESTRA */}
      {PAINTINGS_RIGHT.map((painting, idx) => (
        <Painting 
          key={`right-${idx}`}
          position={painting.position} 
          rotation={[0, -Math.PI / 2, 0]}
          title={painting.title}
          idx={idx + 3}
          imageUrl={painting.imageUrl}
        />
      ))}

      {/* QUADRO GRANDE PARETE FONDO */}
      {BIG_PAINTING.map((painting, idx) => (
        <Painting 
          key={`big-${idx}`}
          position={painting.position} 
          rotation={[0, 0, 0]}
          title={painting.title}
          idx={idx}
          imageUrl={painting.imageUrl}
          scale={2}
        />
      ))}
    </group>
  )
}