import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Services.css';

function Services() {
  return (
    <div className="services-container">
      <h2 className="services-title">Our Services</h2>
      <div className="card-container">
        <div className="card">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW95LMwpE1ySWYkUETgtUUsWoQtHSkfXTaOQ&s"
            alt="Editor"
            className="card-image"
          />
          <div className="card-content">
            <h3>Editor</h3>
            <p>Create and manage AR content for our museum exhibits.</p>
            <Link to="/services/editor" className="card-link">
              Go to Editor
            </Link>
          </div>
        </div>
        <div className="card">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW95LMwpE1ySWYkUETgtUUsWoQtHSkfXTaOQ&s"
            alt="viewer"
            className="card-image"
          />
          <div className="card-content">
            <h3>Viewer</h3>
            <p>Create and manage AR content for our museum exhibits.</p>
            <Link to="/services/mobile-viewer" className="card-link">
              Go to Mobile Viewing
            </Link>
          </div>
        </div>
        <div className="card">
          <img
            src="https://www.livehome3d.com/assets/img/articles/view-home-model-in-ar/3d-model-of-modern-house.jpg"
            alt="AR Viewer"
            className="card-image"
          />
          <div className="card-content">
            <h3>AR Viewer</h3>
            <p>Experience art through augmented reality on your mobile device.</p>
            <Link to="/services/ar-viewer" className="card-link">
              Go to AR Viewer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
