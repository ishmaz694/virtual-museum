import { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import OriginsRoom from './OriginsRoom'
import TravelsGallery from './TravelsGallery'
import FinalBox from './FinalBox'


// Quadri sulla parete SINISTRA 
const PAINTINGS_LEFT = [
  { position: [-5.5, 1.8, -9], title: 'Piazza del Duomo', imageUrl: '/images/piazzaduomo.jpg' },
  { position: [-5.5, 1.8, -14], title: 'Basilica di Santa Croce', imageUrl: '/images/basilicasantacroce.jpg' },
  { position: [-5.5, 1.8, -21], title: 'Piazzale Michelangelo', imageUrl: '/images/piazzalemichelangelo.jpg' },
  { position: [-5.5, 1.8, -38], title: 'Ponte Vecchio', imageUrl: '/images/pontevecchio.jpg' },
  { position: [-5.5, 1.8, -46], title: 'Piazza della Signoria', imageUrl: '/images/piazzasignoria.jpg' },
]

// Quadri sulla parete DESTRA
const PAINTINGS_RIGHT = [
  { position: [5.5, 1.8, -9], title: 'La Prima Uscita', imageUrl: 'images/rinascente.jpg' },
  { position: [5.5, 1.8, -14], title: 'La Tua Gisotra', imageUrl: 'images/giostra.jpg' },
  { position: [5.5, 1.8, -21], title: 'IED', imageUrl: 'images/ied.jpg' },
  { position: [5.5, 1.8, -38], title: 'Palazzo Pitti', imageUrl: 'images/palazzopitti.jpg' },
  { position: [5.5, 1.8, -46], title: 'Galleria degli Uffizi', imageUrl: 'images/uffizi.jpg' },
]

// Porte - POSIZIONATE CORRETTAMENTE
const DOORS = [
  { 
    position: [-5.5, 0.8, -27], 
    rotation: [0, Math.PI / 2, 0],
    title: 'Sala delle Origini', 
    room: 'origins',
    color: '#ff6b9d',
    doorColor: '#d4a373',  // Marrone chiaro
    side: 'left'
  },
  { 
    position: [5.5, 0.8, -27], 
    rotation: [0, -Math.PI / 2, 0],
    title: 'Galleria dei Viaggi', 
    room: 'travels',
    color: '#4ecdc4',
    doorColor: '#c96d3f',  // Arancio
    side: 'right'
  },
  { 
    position: [0, 0.8, -54], 
    rotation: [0, 0, 0],
    title: 'Un Pensiero', 
    room: 'final',
    color: '#ff1493',
    doorColor: '#d4a574',
    side: 'center'
  },
]

function Painting({ position, rotation, title, idx, imageUrl }) {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    if (imageUrl && imageUrl.trim().length > 0) {
      const timeout = setTimeout(() => {
        const loader = new THREE.TextureLoader()
        loader.load(
          imageUrl,
          (loadedTexture) => {
            setTexture(loadedTexture)
          },
          undefined,
          (error) => {
            console.error('Errore caricamento immagine:', imageUrl, error)
            setTexture(null)
          }
        )
      }, 100) // Ritarda il caricamento di 100ms
      
      return () => clearTimeout(timeout)
    } else {
      setTexture(null)
    }
  }, [imageUrl])

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Cornice sottile - nero/grigio scuro */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[2.8, 2, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Tela - Se c'è un'immagine la mostra, altrimenti colore placeholder */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[2.6, 1.8, 0.06]} />
        {texture ? (
          <meshStandardMaterial map={texture} />
        ) : (
          <meshStandardMaterial 
            color={`hsl(${idx * 90}, 65%, 45%)`}
            emissive={`hsl(${idx * 90}, 65%, 25%)`}
          />
        )}
      </mesh>

      {/* Titolo quadro */}
      <Text
        position={[0, -1.1, 0.08]}
        fontSize={0.25}
        color="#1a1a1a"
        anchorX="center"
      >
        {title}
      </Text>
    </group>
  )
}

function Door({ position, rotation, title, room, color, onEnter, isHovered, onHoverChange }) {
  return (
    <group 
      position={position}
      rotation={rotation}
    >
      {/* Area cliccabile invisibile */}
      <mesh 
        position={[0, 0, 0.5]}
        onClick={() => onEnter(room)}
        onPointerEnter={() => onHoverChange?.(true)}
        onPointerLeave={() => onHoverChange?.(false)}
        style={{ cursor: 'pointer' }}
      >
        <boxGeometry args={[2.5, 3, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Cornice porta - colore personalizzato */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2.2, 2.8, 0.12]} />
        <meshStandardMaterial 
          color={color}
          emissive={isHovered ? color : '#000000'}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Porta */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[2, 2.6, 0.1]} />
        <meshStandardMaterial 
          color="#0a0e1a"
          emissive={isHovered ? color : '#000000'}
        />
      </mesh>

      {/* Maniglia */}
      <mesh position={[0.85, 0, 0.25]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Label porta */}
      <Text
        position={[0, 1.7, 0.2]}
        fontSize={0.28}
        color={isHovered ? '#ffff00' : color}
        anchorX="center"
        anchorY="top"
      >
        {title}
      </Text>

      {/* Hover indicator */}
      {isHovered && (
        <Text
          position={[0, -1.5, 0.2]}
          fontSize={0.18}
          color="#ffff00"
          anchorX="center"
        >
          Clicca per entrare
        </Text>
      )}
    </group>
  )
}

export default function Corridor({ onEnterRoom, onExitRoom, currentRoom, onShowLetter }) {
  const { camera } = useThree()
  
  // Reset posizione quando torna dal corridoio
  useEffect(() => {
    if (!currentRoom) {
      camera.position.set(0, 1.6, -10)
      playerPos.current.set(0, 1.6, -10)
    }
  }, [currentRoom, camera])

  const keysPressed = useRef({})
  const [hoveredDoor, setHoveredDoor] = useState(null)
  const playerPos = useRef(new THREE.Vector3(0, 1.6, -20))
  const doorStayTime = useRef({})
  const DOOR_PROXIMITY = 2 // Distanza per riconoscere la porta
  const DOOR_STAY_TIME = 1000 // 2 secondi in millisecondi

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

    // Azzera componente Y per il movimento orizzontale
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
      
      // Calcola la nuova posizione
      const newPos = camera.position.clone()
      newPos.addScaledVector(direction, speed)

      // Collisioni con i muri
      const playerRadius = 0.5
      
      // Limita il movimento: corridoio stretto e lungo
      newPos.x = Math.max(-5.5 + playerRadius, Math.min(5.5 - playerRadius, newPos.x))
      newPos.y = Math.max(0.5, Math.min(3, newPos.y))
      newPos.z = Math.max(-53.7 + playerRadius, Math.min(0.5 - playerRadius, newPos.z))
      
      camera.position.copy(newPos)
    }

    // Mantiene la camera a terra
    camera.position.y = 1.6
    
    // Aggiorna playerPos per il rilevamento porte
    playerPos.current.copy(camera.position)

    // VERIFICA PROSSIMITÀ PORTE
    const currentTime = Date.now()
    let nearestDoor = null
    let nearestDistance = Infinity

    DOORS.forEach((door) => {
      const distance = Math.sqrt(
        Math.pow(playerPos.current.x - door.position[0], 2) +
        Math.pow(playerPos.current.z - door.position[2], 2)
      )
      
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestDoor = door
      }
    })

    // Se sei vicino a una porta
    if (nearestDoor && nearestDistance < DOOR_PROXIMITY) {
      if (!doorStayTime.current[nearestDoor.room]) {
        doorStayTime.current[nearestDoor.room] = currentTime
      }

      const timeNearDoor = currentTime - doorStayTime.current[nearestDoor.room]

      // Se stai vicino per 2 secondi, entra!
      if (timeNearDoor > DOOR_STAY_TIME) {
        onEnterRoom(nearestDoor.room)
      }
    } else {
      // Resetta i timer se ti allontani
      doorStayTime.current = {}
    }
  })

  // Gestione mouse look
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!document.pointerLockElement) return

      const movementX = e.movementX || 0
      const movementY = e.movementY || 0

      const euler = new THREE.Euler(0, 0, 0, 'YXZ')
      euler.setFromQuaternion(camera.quaternion)

      euler.setFromVector3(new THREE.Vector3(
        euler.x - (movementY * 0.005),
        euler.y - (movementX * 0.005),
        0
      ))

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

  if (currentRoom) {
    switch (currentRoom) {
      case 'origins':
        return <OriginsRoom onExitRoom={() => onEnterRoom(null)} />
      case 'travels':
        return <TravelsGallery onExitRoom={() => onEnterRoom(null)} />
      case 'final':
        return <FinalBox onExitRoom={() => onEnterRoom(null)} onShowLetter={onShowLetter} />
      default:
        return null
    }
  }

  return (
    <group>
      {/* PAVIMENTO - bianco panna */}
      <mesh position={[0, 0, -27]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11, 55]} />
        <meshStandardMaterial color="#f5f1e8" />
      </mesh>

      {/* SOFFITTO - bianco panna luminoso */}
      <mesh position={[0, 3.5, -27]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 55]} />
        <meshStandardMaterial color="#fffbf5" />
      </mesh>

      {/* MURO SINISTRO (parete lunga) - bianco ghiaccio */}
      <mesh position={[-5.5, 1.75, -27]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[55, 3.5]} />
        <meshStandardMaterial color="#f0f4f8" />
      </mesh>

      {/* MURO DESTRO (parete lunga) - bianco ghiaccio */}
      <mesh position={[5.5, 1.75, -27]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[55, 3.5]} />
        <meshStandardMaterial color="#f0f4f8" />
      </mesh>

      {/* MURO FONDO - bianco ghiaccio */}
      <mesh position={[0, 1.75, -54.5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[11, 3.5]} />
        <meshStandardMaterial color="#f0f4f8" />
      </mesh>

      {/* LUCI MARCATE lungo il corridoio */}
      <ambientLight intensity={1.2} color="#ffffff" />
      {[-5, -15, -25, -35, -45, -55].map((z, i) => (
        <pointLight 
          key={`light-${i}`} 
          position={[0, 3.3, z]} 
          intensity={1.5} 
          color="#ffffff"
          distance={20}
        />
      ))}
      
      {/* Luci laterali per illuminare quadri e porte */}
      {[-15, -27, -42].map((z, i) => (
        <group key={`side-lights-${i}`}>
          <pointLight position={[-5.2, 2.5, z]} intensity={1} color="#ffd700" distance={15} />
          <pointLight position={[5.2, 2.5, z]} intensity={1} color="#ffd700" distance={15} />
        </group>
      ))}

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
          idx={idx + 4}
          imageUrl={painting.imageUrl}
        />
      ))}

      {/* PORTE */}
      {DOORS.map((door, idx) => (
        <Door
          key={`door-${idx}`}
          position={door.position}
          rotation={door.rotation}
          title={door.title}
          room={door.room}
          color={door.doorColor || door.color}
          isHovered={hoveredDoor === idx}
          onEnter={onEnterRoom}
          onHoverChange={(hovering) => setHoveredDoor(hovering ? idx : null)}
        />
      ))}

      {/* ISTRUZIONI SULLA PARETE FRONTALE */}
      {/* Titolo sulla parete di fronte */}
      <Text
        position={[0, 2.5, 2.05]}
        fontSize={0.6}
        color="#ff6b9d"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        Virtual Museum 
      </Text>

      {/* Sottotitolo */}
      <Text
        position={[0, 1.8, 2.05]}
        fontSize={0.35}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        Ciao Topa
      </Text>

      {/* Istruzioni linea 1 */}
      <Text
        position={[0, 1.2, 2.05]}
        fontSize={0.28}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        WASD - Muoviti nel museo
      </Text>

      {/* Istruzioni linea 2 */}
      <Text
        position={[0, 0.8, 2.05]}
        fontSize={0.28}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        MOUSE - Guarda intorno
      </Text>

      {/* Istruzioni linea 3 */}
      <Text
        position={[0, 0.4, 2.05]}
        fontSize={0.28}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        CLICK PORTE - Entra nelle stanze
      </Text>
    </group>
  )
}

