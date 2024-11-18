// src/pages/About.js
import React from 'react';
import '../styles/About.css';
import image from './ar-museum.jpg';

function About() {
  return (
    <div className="about-container">
      <h1 className="title">About the AR Museum</h1>
      <p className="description">
        The AR Museum project is designed to bring the museum experience to everyone, everywhere.
        Using cutting-edge mobile augmented reality, we enable users to virtually explore museum exhibits from
        any location. Our mission is to democratize access to art, history, and culture by breaking down
        physical barriers and offering an immersive, educational experience.
      </p>
      <p className="description">
        This project began with a vision to make museum visits accessible, interactive, and engaging,
        leveraging AR technology to reach audiences across the globe. By simply using their mobile devices,
        users can view exhibits in 3D, walk around artifacts, and learn about historical and cultural significance
        as though they are physically present in the museum.
      </p>
      <p className="description">
        Join us on this journey to revolutionize how we experience art and heritage, making it a truly
        borderless and inclusive experience.
      </p>
      <img 
        className="image"
        src={image}
        alt="AR Museum Experience"
      />
    </div>
  );
}

export default About;
