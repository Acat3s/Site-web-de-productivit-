import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import VideoStorageApp from "./apps/VideoStorageApp";
import NotesApp from "./apps/NotesApp";
import "./App.css";

const Home = () => (
  <div className="app-container">
    <h1 className="title">📌 Mon Tableau de Productivité</h1>
    <div className="apps-grid">
      <Link to="/video" className="app-card">
        <img src="/icons/media.png" alt="Vidéo" className="app-icon" />
        <span>Stockage Vidéo</span>
      </Link>

      <Link to="/notes" className="app-card">
        <img src="/icons/notes.png" alt="Notes" className="app-icon" />
        <span>Notes</span>
      </Link>
    </div>
  </div>
);

const AppWrapper = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div>
      {!isHome && (
        <div className="top-bar">
          <Link to="/" className="home-button">
            🏠 Revenir à l'accueil
          </Link>
        </div>
      )}
      {children}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video" element={<VideoStorageApp />} />
          <Route path="/notes" element={<NotesApp />} />
        </Routes>
      </AppWrapper>
    </Router>
  );
};

export default App;
