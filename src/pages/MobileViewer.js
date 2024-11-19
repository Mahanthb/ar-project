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

const MuseumViewer = () => {
  const [modelSrc, setModelSrc] = useState('');
  const [firebaseFiles, setFirebaseFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isWebXRSupported, setIsWebXRSupported] = useState(false);
  const [modelHistory, setModelHistory] = useState({});
  const [historyText, setHistoryText] = useState('');
  const [isReading, setIsReading] = useState(false);
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

  // Load models from Firebase
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

  // Load metadata (history) for each model
  const loadMetadata = async () => {
    const metadataRef = ref(storage, 'metadata.json');
    const metadataUrl = await getDownloadURL(metadataRef);
    const response = await fetch(metadataUrl);
    const data = await response.json();
    setModelHistory(data);
  };

  useEffect(() => {
    loadFirebaseFiles(); // Load models
    loadMetadata();      // Load metadata
  }, []);

  // Handle file upload from local storage
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      const url = URL.createObjectURL(file);
      setModelSrc(url);
      setHistoryText('History not available for this model.');
    } else {
      alert('Please upload a .glb or .gltf file');
    }
  };

  const triggerFileInput = () => {
    inputFileRef.current.click();
  };

  const handleFirebaseFileUpload = async (url, name) => {
    setLoading(true);
    setModelSrc(url);
    const description = modelHistory[name] || 'History not available for this model.';
    setHistoryText(description);
    readAloud(description); // Call text-to-speech
    setLoading(false);
  };

  // Text-to-speech function
// Text-to-speech function with cancel functionality
const readAloud = (text) => {
    if (isReading) {
      // If already reading, stop the speech
      window.speechSynthesis.cancel();
      setIsReading(false);  // Update state to reflect the reading status
    } else {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Create new SpeechSynthesisUtterance object
      const speech = new SpeechSynthesisUtterance();
      speech.text = text;
      speech.lang = 'en-US';
      speech.rate = 1;
      speech.pitch = 1;

      // Start speaking
      window.speechSynthesis.speak(speech);
      setIsReading(true);  // Update state to reflect that speech is playing
    }
  }; 

  // Start AR session using WebXR
  const startARSession = async () => {
    if (!navigator.xr) {
      alert('WebXR is not supported on this device.');
      return;
    }
  
    try {
      // Request AR session with light estimation
      const xrSession = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor', 'light-estimation'], // Add light-estimation feature
      });
  
      const modelViewer = modelViewerRef.current; // Access model-viewer ref
      modelViewer.setAttribute('xr', '');
      modelViewer.xrSession = xrSession;
      modelViewer.activateAR();
  
      // Set up light estimation
      xrSession.addEventListener('selectstart', (event) => {
        const lightEstimation = event.session.requestLightEstimation();
        if (lightEstimation) {
          lightEstimation.addEventListener('change', (e) => {
            const { lightIntensity, colorTemperature } = e;
            
            // Adjust lighting based on light estimation
            // For example, adjust model viewer environment lighting
            modelViewer.setAttribute('environment-image', lightIntensity);
            modelViewer.setAttribute('shadow-intensity', colorTemperature);
          });
        }
      });
  
      xrSession.addEventListener('end', () => {
        modelViewer.xrSession = null;
      });
  
    } catch (error) {
      console.error('Failed to start AR session:', error);
      alert('Unable to start AR session on this device.');
    }
  };
  

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
        <select onChange={(e) => {
          const selectedFile = firebaseFiles.find(file => file.url === e.target.value);
          handleFirebaseFileUpload(selectedFile.url, selectedFile.name);
        }}>
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
            camera-controls
            auto-rotate
            style={{ width: '100%', height: '500px' }}
            touch-action="manipulation"
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

      {modelSrc && (
        <div className="history-section">
          <h3>History</h3>
          <p>{historyText}</p>
          <button onClick={() => readAloud(historyText)}>🔊 Read Aloud</button>
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

export default MuseumViewer;
