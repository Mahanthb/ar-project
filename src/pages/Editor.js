import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Loader } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/Editor.css'; // Import the CSS file for styling

function Model({ fileUrl, playAnimation, isWireframe }) {
  const { scene, animations } = useGLTF(fileUrl);
  const mixer = useRef();

  // Ensure that the model casts and receives shadows
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      // Set wireframe mode if isWireframe is true
      if (isWireframe) {
        child.material.wireframe = true;
      } else {
        child.material.wireframe = false; // Ensure wireframe is off if not in wireframe mode
      }
    }
  });

  // Set up animation mixer
  useEffect(() => {
    if (animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        mixer.current.clipAction(clip).play();
      });
    }
    return () => {
      mixer.current && mixer.current.stopAllAction();
    };
  }, [animations, scene]);

  // Update animation state on render
  useFrame((state, delta) => {
    if (mixer.current && playAnimation) {
      mixer.current.update(delta);
    }
  });

  return <primitive object={scene} scale={[1, 1, 1]} castShadow receiveShadow />;
}

function MuseumScene() {
  const [fileUrl, setFileUrl] = useState(null);
  const [playAnimation, setPlayAnimation] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#808080');
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(0.5);
  const [directionalLightPosition, setDirectionalLightPosition] = useState([5, 5, 5]);
  const [directionalLightIntensity, setDirectionalLightIntensity] = useState(1);
  const [isWireframe, setIsWireframe] = useState(false);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.glb')) {
      const fileURL = URL.createObjectURL(file);
      setFileUrl(fileURL);
    } else {
      alert('Please upload a valid .glb file');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* File Upload Button */}
      <input
        type="file"
        accept=".glb"
        onChange={handleFileUpload}
        style={{
          position: 'absolute',
          zIndex: 2,
          top: '20px',
          left: '20px',
          padding: '10px',
          fontSize: '14px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Controls Card */}
      <div className="controls-card">
        <h3>Controls</h3>
        <div>
          <h4>Background Color</h4>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>
        <div>
          <h4>Wireframe Mode</h4>
          <label>
            <input
              type="checkbox"
              checked={isWireframe}
              onChange={(e) => setIsWireframe(e.target.checked)}
            />
            Enable Wireframe
          </label>
        </div>
        <div>
          <h4>Animation Controls</h4>
          <button onClick={() => setPlayAnimation(true)}>Play Animation</button>
          <button onClick={() => setPlayAnimation(false)}>Pause Animation</button>
        </div>
        <div>
          <h4>Ambient Light</h4>
          <label>
            Intensity:
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={ambientLightIntensity}
              onChange={(e) => setAmbientLightIntensity(parseFloat(e.target.value))}
            />
          </label>
        </div>
        <div>
          <h4>Directional Light</h4>
          <label>
            Position X:
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={directionalLightPosition[0]}
              onChange={(e) => setDirectionalLightPosition([parseFloat(e.target.value), directionalLightPosition[1], directionalLightPosition[2]])}
            />
          </label>
          <label>
            Position Y:
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={directionalLightPosition[1]}
              onChange={(e) => setDirectionalLightPosition([directionalLightPosition[0], parseFloat(e.target.value), directionalLightPosition[2]])}
            />
          </label>
          <label>
            Position Z:
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={directionalLightPosition[2]}
              onChange={(e) => setDirectionalLightPosition([directionalLightPosition[0], directionalLightPosition[1], parseFloat(e.target.value)])}
            />
          </label>
          <label>
            Intensity:
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={directionalLightIntensity}
              onChange={(e) => setDirectionalLightIntensity(parseFloat(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* Canvas and 3D Scene */}
      <Canvas
        shadows
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [0, 5, 10], fov: 75 }}
        gl={{ alpha: false }} // Disable transparency (optional)
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(backgroundColor)); // Set background color
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows
        }}
      >
        <Suspense fallback={null}>
          {fileUrl && <Model fileUrl={fileUrl} playAnimation={playAnimation} isWireframe={isWireframe} />}
          <ambientLight intensity={ambientLightIntensity} />
          <directionalLight
            position={directionalLightPosition}
            intensity={directionalLightIntensity}
            castShadow
            shadow-mapSize-width={2048} // Set shadow resolution
            shadow-mapSize-height={2048}
            shadow-camera-near={0.1}
            shadow-camera-far={50}
          />
          {/* Add GridHelper */}
          <gridHelper args={[10, 10, 0xffffff, 0xffffff]} position={[0, -0.5, 0]} />
          <mesh receiveShadow position={[0, -0.5, 0]}>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.5} />
          </mesh>
          <OrbitControls />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>

      <Loader />
    </div>
  );
}

export default function Editor() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MuseumScene />
    </div>
  );
}
