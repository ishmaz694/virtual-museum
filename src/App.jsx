import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Corridor from './components/Corridor'
import Letter from './pages/Letter'
import './styles/App.css'

export default function App() {
  const [inRoom, setInRoom] = useState(null)
  const [showLetter, setShowLetter] = useState(false)

  if (showLetter) {
    return <Letter />
  }

  return (
    <div className="app-container">
      <Canvas 
        camera={{ position: [0, 1.6, -20], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ 
          antialias: false,
          pixelRatio: window.devicePixelRatio / 2,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#f0f4f8']} />
        
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <Corridor 
          onEnterRoom={setInRoom} 
          onExitRoom={() => setInRoom(null)}
          currentRoom={inRoom}
          onShowLetter={setShowLetter}
        />
      </Canvas>
    </div>
  )
}