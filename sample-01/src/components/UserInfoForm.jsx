// src/components/UserInfoForm.jsx

import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const UserInfoForm = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    age: "",
    poids: "",
    taille: "",
    rhesus: "",
    allergies: "",
    email: ""
  });
  const [editing, setEditing] = useState(false);

  // Charger les infos si existantes
  useEffect(() => {
    (async () => {
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `http://localhost:3001/get-user-info?auth0_id=${user.sub}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setForm({
          firstname: data.firstname || "",
          lastname:  data.lastname  || "",
          age:       data.age       || "",
          poids:     data.poids     || "",
          taille:    data.taille    || "",
          rhesus:    data.rhesus    || "",
          allergies: data.allergies || "",
          email:     data.email     || "",
        });
        setEditing(true);
      }
    })();
  }, [getAccessTokenSilently, user.sub]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = await getAccessTokenSilently();
    const url = editing
      ? "http://localhost:3001/update-user-info"
      : "http://localhost:3001/save-user-info";
    const method = editing ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...form, auth0_id: user.sub })
    });
    alert(editing ? "Mis à jour avec succès !" : "Enregistré !");
    setEditing(true);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="mb-4">
        {editing ? "Mes informations de santé" : "Nouveau profil santé"}
      </h2>

      <div className="mb-3">
        <label className="form-label">Prénom</label>
        <input
          name="firstname"
          value={form.firstname}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Nom</label>
        <input
          name="lastname"
          value={form.lastname}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="row mb-3">
        <div className="col">
          <label className="form-label">Âge</label>
          <input
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="col">
          <label className="form-label">Poids (kg)</label>
          <input
            name="poids"
            type="number"
            value={form.poids}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <label className="form-label">Taille (cm)</label>
          <input
            name="taille"
            type="number"
            value={form.taille}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="col">
          <label className="form-label">Groupe sanguin (rhesus)</label>
          <input
            name="rhesus"
            value={form.rhesus}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Allergies</label>
        <textarea
          name="allergies"
          value={form.allergies}
          onChange={handleChange}
          className="form-control"
          rows={3}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <button type="submit" className="btn btn-success">
        {editing ? "Mettre à jour" : "Enregistrer"}
      </button>
    </form>
  );
};

export default UserInfoForm;
