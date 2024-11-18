import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import '../styles/MobileViewer.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfWYRWOQyNrn9WGv3Wfz_EM47ZpbL_Yqs",
  authDomain: "virtual-world-84ce0.firebaseapp.com",
  projectId: "virtual-world-84ce0",
  storageBucket: "virtual-world-84ce0.appspot.com",
  messagingSenderId: "306111432374",
  appId: "1:306111432374:web:1b7d4cfea3b7ab7ef123f7",
  measurementId: "G-1K1M3CNJR7",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const storage = getStorage(app);

const MobileViewer = () => {
  const [modelSrc, setModelSrc] = useState('');
  const [firebaseFiles, setFirebaseFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef();
  const [isWebXRSupported, setIsWebXRSupported] = useState(false);
  let camera, scene, renderer, model, controls;

  // Initialize Firebase files list
  const loadFirebaseFiles = async () => {
    const listRef = ref(storage, '/');
    const res = await listAll(listRef);
    const files = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      })
    );
    setFirebaseFiles(files);
  };

  useEffect(() => {
    loadFirebaseFiles();
  }, []);

  // Check WebXR support
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsWebXRSupported(supported);
      });
    }
  }, []);

  // Initialize Three.js scene
  const initScene = () => {
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Scene and Camera setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    camera.position.set(0, 1.6, 3);
    scene.add(camera);

    // Light setup
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Window resize handler
    window.addEventListener('resize', onWindowResize);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // Load and display the model
  const loadModel = (url) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        model = gltf.scene;
        model.scale.set(0.1, 0.1, 0.1);
        model.position.set(0, 0, 0);
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  };

  // Start AR session
  const startARSession = async () => {
    if (!navigator.xr) {
      alert('WebXR is not supported on this device.');
      return;
    }

    try {
      const xrSession = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor'],
      });

      renderer.xr.setSession(xrSession);
    } catch (error) {
      console.error('Failed to start AR session:', error);
      alert('Unable to start AR session on this device.');
    }
  };

  // Handle Firebase model selection
  const handleFirebaseFileUpload = (url) => {
    setLoading(true);
    setModelSrc(url);
    loadModel(url);
    setLoading(false);
  };

  // Animation loop
  const animate = () => {
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  // Initialize and animate scene
  useEffect(() => {
    initScene();
    animate();

    return () => {
      if (renderer) {
        renderer.setAnimationLoop(null);
        window.removeEventListener('resize', onWindowResize);
      }
    };
  }, []);

  return (
    <div className="ar-viewer-container" ref={containerRef}>
      <div className="firebase-file-selector">
        <label>Select 3D Model from Firebase:</label>
        <select onChange={(e) => handleFirebaseFileUpload(e.target.value)}>
          <option value="">Select a model...</option>
          {firebaseFiles.map((file) => (
            <option key={file.url} value={file.url}>{file.name}</option>
          ))}
        </select>
      </div>

      <button className="view-ar-button" onClick={startARSession}>
        View in AR
      </button>

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default MobileViewer;
