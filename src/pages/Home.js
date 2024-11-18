// src/pages/Home.js
import React from 'react';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <h1 className="title">Welcome to the AR Museum</h1>
      <h2 className="subtitle">Experience Art Anywhere, Anytime</h2>
      <p className="description">
        Dive into the world of art and history from the comfort of your own space with our AR Museum.
        Through the power of augmented reality, you can explore museum exhibits virtually on your mobile device,
        viewing detailed sculptures, paintings, and artifacts as if you were there in person.
        Experience a new way of interacting with cultural heritage—right at your fingertips.
      </p>

      <div className="card-container">
        <div className="card">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb8_ZOHNdBUXI8N0EU7cZkfLRdjdwLzDmQ3w&s" alt="Exhibit 1" />
          <h3>Explore</h3>
          <p>Explore the stunning details of ancient artifacts.</p>
        </div>
        <div className="card">
          <img src="https://img.jagranjosh.com/images/2023/October/4102023/Expensive-Paintings.jpg" alt="Exhibit 2" />
          <h3>Discover</h3>
          <p>Discover the history behind famous paintings.</p>
        </div>
        <div className="card">
          <img src="https://plus.unsplash.com/premium_photo-1664438942574-e56510dc5ce5?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YWJzdHJhY3QlMjBhcnR8ZW58MHx8MHx8fDA%3D" alt="Exhibit 3" />
          <h3>Exhibit</h3>
          <p>Immerse yourself in the beauty of modern art.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
