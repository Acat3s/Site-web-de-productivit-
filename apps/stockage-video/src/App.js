import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import VideoStorageApp from "./VideoStorageApp";
import "./App.css";

function App() {
  const location = useLocation();

  return (
    <Router>
      <div className="app-container">
        <h1 className="title">📌 Mon Tableau de Productivité</h1>
        {location.pathname === "/" ? (
          <div className="apps-grid">
            <Link to="/media-storage" className="app-card">
              <img src="/icons/media.png" alt="Stockage Médias" className="app-icon" />
              <span>Stockage de Médias</span>
            </Link>
          </div>
        ) : (
          <Link to="/" className="back-button">
            ⬅️ Retour à l'accueil
          </Link>
        )}
        <Routes>
          <Route path="/media-storage" element={<VideoStorageApp />} />
          <Route path="/" element={<h2>🏠 Accueil</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
