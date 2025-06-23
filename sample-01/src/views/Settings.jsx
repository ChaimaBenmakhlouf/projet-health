// src/views/Settings.jsx

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import BackButton from "../components/BackButton";


const Settings = () => {
  const { user, getAccessTokenSilently, logout } = useAuth0();

  const handleGDPRDelete = async () => {
    if (
      !window.confirm(
        "⚠️ Voulez-vous vraiment supprimer toutes vos données ?\n" +
        "Cette action est irréversible."
      )
    ) return;

    try {
      // 1) Récupère le token
      const token = await getAccessTokenSilently();
      console.log("🔐 Token:", token);

      // 2) Construit bien l'URL complète
      const url = `http://localhost:3001/delete-user-info?auth0_id=${encodeURIComponent(user.sub)}`;
      console.log("🔪 DELETE vers :", url);

      // 3) Envoie la requête
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("📡 Status :", res.status);
      const text = await res.text();
      console.log("📋 Response body :", text);

      if (!res.ok) throw new Error(res.status);

      // Si ton endpoint renvoie du JSON, pars-le :
      // const { prescriptionsDeleted, userDeleted } = JSON.parse(text);

      alert("✅ Toutes vos données ont été supprimées.");
      // Déconnexion
      logout({ logoutParams: { returnTo: window.location.origin } });
    } catch (err) {
      console.error("Erreur RGPD :", err);
      alert("❌ Impossible de supprimer vos données. Regarde la console.");
    }
  };

  return (
    <div className="container mt-5">
           <BackButton />
      <h2>Paramètres</h2>
 
      <button className="btn btn-danger" onClick={handleGDPRDelete}>
        Supprimer toutes mes données (RGPD)
      </button>
    </div>
  );
};

export default Settings;
