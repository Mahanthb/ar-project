import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { XR, ARButton } from '@react-three/xr';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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
  measurementId: "G-1K1M3CNJR7"
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
  const inputFileRef = useRef(null);

  // Handle file upload from local storage
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      const url = URL.createObjectURL(file);
      setModelSrc(url);
    } else {
      alert('Please upload a .glb or .gltf file');
    }
  };

  const triggerFileInput = () => {
    inputFileRef.current.click();
  };

  const handleFirebaseFileUpload = async (url) => {
    setLoading(true);
    setModelSrc(url);
    setLoading(false);
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

  useEffect(() => {
    loadFirebaseFiles();
  }, []);

  return (
    <div className="ar-viewer-container">
      <button className="upload-button" onClick={triggerFileInput}>Upload 3D Model</button>
      <input
        type="file"
        accept=".glb,.gltf"
        style={{ display: 'none' }}
        ref={inputFileRef}
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

      {modelSrc && (
        <div className="model-viewer-container">
          <Canvas style={{ width: '100%', height: '500px' }}>
            <XR>
              <ARButton />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 10]} />
              <OrbitControls />
              <Model src={modelSrc} />
            </XR>
          </Canvas>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

const Model = ({ src }) => {
  const gltf = useLoader(GLTFLoader, src);

  return (
    <primitive object={gltf.scene} scale={0.5} position={[0, 0, 0]} />
  );
};

export default MobileViewer;
