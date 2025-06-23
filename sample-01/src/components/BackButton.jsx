// src/components/BackButton.jsx
import React from "react";
import { Link } from "react-router-dom";

const BackButton = () => (
  <Link to="/" className="btn btn-outline-secondary mb-4" style={{ width: "fit-content" }}>
    ← Retour à l’accueil
  </Link>
);

export default BackButton;
