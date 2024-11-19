import React, { useState, useRef, useEffect } from 'react';
import '../styles/ARViewer.css';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import * as THREE from 'three';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const firebaseConfig = {
  apiKey: "AIzaSyCfWYRWOQyNrn9WGv3Wfz_EM47ZpbL_Yqs",
  authDomain: "virtual-world-84ce0.firebaseapp.com",
  projectId: "virtual-world-84ce0",
  storageBucket: "virtual-world-84ce0.appspot.com",
  messagingSenderId: "306111432374",
  appId: "1:306111432374:web:1b7d4cfea3b7ab7ef123f7",
  measurementId: "G-1K1M3CNJR7"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const storage = getStorage(app);

const ARViewer = () => {
  const [modelSrc, setModelSrc] = useState('');
  const [firebaseFiles, setFirebaseFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    initializeThreeJS();
    loadFirebaseFiles();
  }, []);

  const initializeThreeJS = () => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(XRButton.createButton(renderer));
    canvasRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 3);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
  };

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

  const loadModel = (url) => {
    const loader = new GLTFLoader();
    setLoading(true);

    loader.load(
      url,
      (gltf) => {
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
        }
        const model = gltf.scene;
        model.position.set(0, 0, -2);
        sceneRef.current.add(model);
        modelRef.current = model;
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        setLoading(false);
      }
    );
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      const url = URL.createObjectURL(file);
      loadModel(url);
    } else {
      alert('Please upload a .glb or .gltf file');
    }
  };

  const handleFirebaseFileUpload = (url) => {
    loadModel(url);
  };

  const startARSession = async () => {
    const renderer = rendererRef.current;
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor', 'light-estimation']
      });
      renderer.xr.setSession(session);

      session.addEventListener('end', () => {
        console.log('AR session ended');
      });
    } catch (error) {
      console.error('Failed to start AR session:', error);
      alert('Unable to start AR session on this device.');
    }
  };

  return (
    <div className="ar-viewer-container">
      <button className="upload-button" onClick={() => document.getElementById('file-input').click()}>Upload 3D Model</button>
      <input
        type="file"
        id="file-input"
        accept=".glb,.gltf"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <div className="firebase-file-selector">
        <label>Select 3D Model from Firebase:</label>
        <select onChange={(e) => handleFirebaseFileUpload(e.target.value)}>
          <option value="">Select a model...</option>
          {firebaseFiles.map((file) => (
            <option key={file.url} value={file.url}>
              {file.name}
            </option>
          ))}
        </select>
      </div>

      <div ref={canvasRef} className="threejs-canvas"></div>

      <button className="ar-button" onClick={startARSession}>
        View in HoloLens
      </button>

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default ARViewer;
