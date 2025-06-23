// src/views/Home.jsx

import React from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Home = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  // 1) Si l’utilisateur n’est pas connecté : invitation à se connecter
  if (!isAuthenticated) {
    return (
      <div className="container mt-5 text-center">
        <section
          className="hero-section p-5 mb-5"
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            borderRadius: "var(--radius)",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <h1 className="display-4 mb-3">Bienvenue sur MyHealthy</h1>
          <p className="lead mb-4">
            Pour accéder à vos données de santé et vos prescriptions, merci de vous connecter.
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="btn btn-light btn-lg hero-btn"
          >
            Se connecter
          </button>
        </section>

        <section className="card p-4 mx-auto" style={{ maxWidth: 600 }}>
          <h2 className="mb-3">Pourquoi s’inscrire ?</h2>
          <ul className="text-start">
            <li>📝 Suivi personnalisé de vos infos médicales</li>
            <li>⏰ Rappels automatiques de vos médicaments</li>
            <li>🔒 Sécurité et confidentialité de vos données</li>
          </ul>
        </section>
      </div>
    );
  }

  // 2) Si l’utilisateur est connecté : affichage complet
  return (
    <div className="container mt-5">
      {/* Hero */}
      <section
        className="p-5 mb-5 text-center"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
          borderRadius: "var(--radius)",
          color: "#fff",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Bulles décoratives */}
        <div style={{
          position: "absolute", width: 200, height: 200,
          borderRadius: "50%", background: "rgba(255,255,255,0.1)",
          top: -50, left: -50
        }} />
        <div style={{
          position: "absolute", width: 300, height: 300,
          borderRadius: "50%", background: "rgba(255,255,255,0.1)",
          bottom: -100, right: -100
        }} />

        <h1 className="mb-3 display-4">Bienvenue sur MyHealthy</h1>
        <p className="lead mb-4">
          Gérez vos données de santé et vos prescriptions en toute simplicité.
        </p>
        <Link
          to="/forms"
          className="btn btn-light btn-lg me-3 hero-btn"
        >
          Mon Dashboard
        </Link>
        <Link
          to="/prescriptions"
          className="btn btn-outline-light btn-lg hero-btn"
        >
          Mes Prescriptions
        </Link>
      </section>

      {/* Fonctionnalités */}
      <section className="row text-center mb-5">
        {[
          {
            title: "Dashboard Santé",
            desc: "Stockez et modifiez vos informations personnelles de santé.",
            link: "/forms",
            icon: "💾"
          },
          {
            title: "Prescriptions",
            desc: "Ajoutez vos médicaments et recevez des rappels automatisés.",
            link: "/prescriptions",
            icon: "💊"
          },
          {
            title: "Paramètres",
            desc: "Gérez vos données RGPD et exportez votre historique.",
            link: "/settings",
            icon: "⚙️"
          }
        ].map((f, i) => (
          <div key={i} className="col-md-4 mb-4">
            <Link to={f.link} className="text-decoration-none">
              <div
                className="card h-100 p-4"
                style={{
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "3rem" }}>{f.icon}</div>
                <h3 className="my-3">{f.title}</h3>
                <p className="text-muted">{f.desc}</p>
                <button className="btn btn-primary mt-2">Voir</button>
              </div>
            </Link>
          </div>
        ))}
      </section>

      {/* À propos */}
      <section className="card p-4 mt-5">
        <h2 className="mb-3">Pourquoi MyHealthy ?</h2>
        <p>
          MyHealthy est votre compagnon de santé numérique. Interface intuitive, sécurité renforcée et rappels personnalisés vous aident à ne jamais oublier vos médicaments ni perdre le fil de votre suivi médical.
        </p>
      </section>
    </div>
  );
};

export default Home;
