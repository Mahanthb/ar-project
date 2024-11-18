import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import '../styles/MobileViewer.css';

const MobileViewer = () => {
  const [modelUrl, setModelUrl] = useState('');
  const [isWebXRSupported, setIsWebXRSupported] = useState(false);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  // Check WebXR support
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsWebXRSupported(supported);
      });
    }
  }, []);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    } else {
      alert('Please upload a .glb or .gltf file');
    }
  };

  const triggerFileInput = () => {
    document.getElementById('fileInput').click();
  };

  // Start AR session
  const startARSession = (renderer) => {
    if (!renderer || !renderer.xr) {
      alert('WebXR is not supported on this device.');
      return;
    }

    renderer.xr.enabled = true;
    const arButton = ARButton.createButton(renderer);
    document.body.appendChild(arButton);
  };

  // Load 3D model
  const loadModel = (url, scene) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, -2);
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error('Failed to load model:', error);
        alert('Failed to load 3D model.');
      }
    );
  };

  // Render 3D model in AR
  const ARScene = () => {
    const scene = sceneRef.current;

    useEffect(() => {
      if (modelUrl && scene) {
        loadModel(modelUrl, scene);
      }
    }, [modelUrl, scene]);

    return (
      <>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
      </>
    );
  };

  return (
    <div className="ar-viewer-container">
      <button className="upload-button" onClick={triggerFileInput}>
        Upload 3D Model
      </button>
      <input
        id="fileInput"
        type="file"
        accept=".glb,.gltf"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {isWebXRSupported && modelUrl && (
        <Canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100vh' }}
          onCreated={({ gl, scene }) => {
            sceneRef.current = scene;
            startARSession(gl);
          }}
          camera={{ position: [0, 1, 3], fov: 60 }}
        >
          <ARScene />
        </Canvas>
      )}

      {!isWebXRSupported && <p>Your device does not support WebXR.</p>}
    </div>
  );
};

export default MobileViewer;
