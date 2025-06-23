// src/views/PrescriptionView.jsx

import React, { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import BackButton from "../components/BackButton";

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

const PrescriptionView = () => {
  const { user, getAccessTokenSilently } = useAuth0();

  // État du formulaire
  const [form, setForm] = useState({
    medication_name: "",
    dosage_quantity: "",
    dosage_frequency: "",
    dosage_duration: "",
    start_date: "",
    end_date: "",
    reminder_time: "",
    notes: "",
  });

  // Liste & édition
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Modal de rappel
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const notifiedRef = useRef(new Set());

  // Récupérer la liste
  const fetchList = async () => {
    const token = await getAccessTokenSilently();
    const res = await fetch(
      `http://localhost:3001/get-prescriptions?auth0_id=${user.sub}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      setList(data);
    }
  };
  useEffect(() => {
    if (user) fetchList();
  }, [user]);

  // Effet de notification + modal
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
      return;
    }
    const checkReminders = () => {
      const now = new Date().toTimeString().slice(0, 5); // "HH:mm"
      list.forEach(p => {
        if (p.reminder_time === now && !notifiedRef.current.has(p._id)) {
          // Afficher le modal de rappel
          setModalContent(
            `🕒 Il est ${now}. Prenez ${p.medication_name} (${p.dosage_quantity} – ${p.dosage_frequency}).`
          );
          setPendingId(p._id);
          setModalOpen(true);
        }
      });
    };

    // Premier check immédiat
    checkReminders();
    // Vérification toutes les 60s
    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, [list]);

  // Handlers CRUD
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    const token = await getAccessTokenSilently();
    const url = editingId
      ? `http://localhost:3001/update-prescription/${editingId}`
      : "http://localhost:3001/save-prescription";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization:`Bearer ${token}`,
      },
      body: JSON.stringify({ ...form, auth0_id: user.sub, user_email: user.email }),
    });
    // Reset
    setForm({
      medication_name: "", dosage_quantity: "", dosage_frequency: "",
      dosage_duration: "", start_date: "", end_date: "",
      reminder_time: "", notes: ""
    });
    setEditingId(null);
    fetchList();
  };
  const handleEdit = p => {
    setEditingId(p._id);
    setForm({
      medication_name: p.medication_name,
      dosage_quantity: p.dosage_quantity,
      dosage_frequency: p.dosage_frequency,
      dosage_duration: p.dosage_duration,
      start_date: p.start_date.slice(0, 10),
      end_date: p.end_date.slice(0, 10),
      reminder_time: p.reminder_time,
      notes: p.notes,
    });
    window.scrollTo(0, 0);
  };
  const handleDelete = async id => {
    const token = await getAccessTokenSilently();
    await fetch(`http://localhost:3001/delete-prescription/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchList();
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Mes prescriptions</h2>
      
            <BackButton />
      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="card p-4 mb-5">
        <h4 className="mb-3">
          {editingId ? "Modifier la prescription" : "Ajouter une prescription"}
        </h4>

        {/* Médicament / Quantité / Fréquence */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Médicament</label>
            <input
              name="medication_name"
              value={form.medication_name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Quantité</label>
            <input
              name="dosage_quantity"
              type="number"
              value={form.dosage_quantity}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Fréquence</label>
            <input
              name="dosage_frequency"
              value={form.dosage_frequency}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        {/* Durée / Dates */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Durée</label>
            <input
              name="dosage_duration"
              value={form.dosage_duration}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Date début</label>
            <input
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Date fin</label>
            <input
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        {/* Rappel / Notes */}
        <div className="mb-3">
          <label className="form-label">Heure de rappel</label>
          <input
            name="reminder_time"
            type="time"
            value={form.reminder_time}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Notes</label>
          <textarea
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Boutons */}
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            {editingId ? "Mettre à jour" : "Enregistrer"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm({
                  medication_name: "", dosage_quantity: "", dosage_frequency: "",
                  dosage_duration: "", start_date: "", end_date: "",
                  reminder_time: "", notes: ""
                });
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* LISTE DES PRESCRIPTIONS */}
      {list.length === 0 ? (
        <p>Aucune prescription trouvée.</p>
      ) : (
        list.map(p => (
          <div key={p._id} className="card p-3 mb-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="mb-1">{p.medication_name}</h5>
                <p className="mb-1">
                  {p.dosage_quantity} • {p.dosage_frequency} • {p.dosage_duration}
                </p>
                <p className="mb-1">
                  Du {new Date(p.start_date).toLocaleDateString()} au{" "}
                  {new Date(p.end_date).toLocaleDateString()}
                </p>
                <p className="mb-1 text-secondary">Rappel à {p.reminder_time}</p>
                {p.notes && <p className="mb-0">{p.notes}</p>}
              </div>
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleEdit(p)}
                >
                  Modifier
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(p._id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* === MODAL DE RAPPEL === */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader toggle={() => setModalOpen(false)}>
          Rappel Médicament
        </ModalHeader>
        <ModalBody>{modalContent}</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              if (pendingId) {
                notifiedRef.current.add(pendingId);
                setPendingId(null);
              }
              setModalOpen(false);
            }}
          >
            OK
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PrescriptionView;
