import React, { useState, useRef, useEffect } from 'react';
import '@google/model-viewer';
import '../styles/ARViewer.css';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

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

const ARViewer = () => {
  const [modelSrc, setModelSrc] = useState('');
  const [firebaseFiles, setFirebaseFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isWebXRSupported, setIsWebXRSupported] = useState(false);
  const inputFileRef = useRef(null);
  const modelViewerRef = useRef(null); // Reference for model-viewer

  // Check WebXR support for AR glass compatibility
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsWebXRSupported(supported);
      });
    }
  }, []);

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

  // Start AR session using WebXR
  const startARSession = async () => {
    if (!navigator.xr) {
      alert('WebXR is not supported on this device.');
      return;
    }

    try {
      const xrSession = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor', 'light-estimation'] // Enable light estimation
      });

      const modelViewer = modelViewerRef.current; // Access model-viewer ref
      modelViewer.setAttribute('xr', '');
      modelViewer.xrSession = xrSession;
      modelViewer.activateAR();

      xrSession.addEventListener('end', () => {
        modelViewer.xrSession = null;
      });
    } catch (error) {
      console.error('Failed to start AR session:', error);
      alert('Unable to start AR session on this device.');
    }
  };

  // Gesture-based interaction setup
  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    let initialTouch = null;

    const handleGestureStart = (event) => {
      if (event.touches.length === 1) {
        initialTouch = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
    };

    const handleGestureMove = (event) => {
      if (initialTouch && event.touches.length === 1) {
        const deltaX = event.touches[0].clientX - initialTouch.x;
        const deltaY = event.touches[0].clientY - initialTouch.y;

        // Adjust the rotation based on gesture movement
        const rotationX = deltaY * 0.1; // Adjust rotation sensitivity as needed
        const rotationY = deltaX * 0.1;

        // Disable rotation for Android
        if (!/Android/i.test(navigator.userAgent)) {
          modelViewer.cameraOrbit = `${rotationY}deg ${rotationX}deg auto`;
        }
      }
    };

    const handleGestureEnd = () => {
      initialTouch = null; // Reset initial touch point
    };

    if (modelViewer) {
      modelViewer.addEventListener('pointerdown', handleGestureStart);
      modelViewer.addEventListener('pointermove', handleGestureMove);
      modelViewer.addEventListener('pointerup', handleGestureEnd);
      modelViewer.addEventListener('pointercancel', handleGestureEnd);
    }

    return () => {
      if (modelViewer) {
        modelViewer.removeEventListener('pointerdown', handleGestureStart);
        modelViewer.removeEventListener('pointermove', handleGestureMove);
        modelViewer.removeEventListener('pointerup', handleGestureEnd);
        modelViewer.removeEventListener('pointercancel', handleGestureEnd);
      }
    };
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
          <model-viewer
            ref={modelViewerRef}
            src={modelSrc}
            alt="A 3D model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls="false" // Disable camera controls
            auto-rotate="false" // Disable auto-rotate
            style={{ width: '100%', height: '500px' }}
            touch-action="none" // Prevent touch actions from moving the model
            interaction-prompt="when-focused"
            environment-image="neutral"
            exposure="1"
            shadow-intensity="1"
            shadow-softness="0.5"
            min-camera-orbit="auto auto 0deg"
            max-camera-orbit="auto auto 360deg"
            min-field-of-view="10deg"
            max-field-of-view="45deg"
          >
            <button className="ar-button" slot="ar-button">View in AR</button>
          </model-viewer>
        </div>
      )}

      {isWebXRSupported && modelSrc && (
        <div className="hololens-ar">
          <button
            className="ar-button hololens-button"
            onClick={startARSession}
          >
            View in HoloLens
          </button>
          <p className="ar-support-text">
            Use a WebXR-compatible browser (e.g., Microsoft Edge) on HoloLens to access this view.
          </p>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default ARViewer;
