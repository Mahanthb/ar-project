// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Team from './pages/Team';
import Editor from './pages/Editor';
import ARViewer from './pages/ARViewer';
import MobileViewer from './pages/MobileViewer';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/editor" element={<Editor />} />
          <Route path="/services/ar-viewer" element={<ARViewer />} />
          <Route path="/services/mobile-viewer" element={<MobileViewer />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
