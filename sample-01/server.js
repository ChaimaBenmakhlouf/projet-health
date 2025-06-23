const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { join } = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Charger .env

const User = require("./models/User"); // Ajout du modèle utilisateur

const app = express();
const port = process.env.SERVER_PORT || 3000;

// Middlewares
app.use(morgan("dev"));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors()); // Permet d'accepter les requêtes React
app.use(express.json()); // Pour lire les données JSON

// Connexion à MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

// ROUTE API - Enregistrer un utilisateur Auth0 avec ses infos santé
app.post("/api/user", async (req, res) => {
  const { auth0_id, email, firstname, lastname, age, poids, taille, rhesus, allergies } = req.body;

  try {
    const existing = await User.findOne({ auth0_id });
    if (existing) return res.status(200).json({ message: "User already exists" });

    const user = new User({ auth0_id, email, firstname, lastname, age, poids, taille, rhesus, allergies });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error("❌ Erreur /api/user :", error);
    res.status(500).json({ error: "Erreur lors de l’enregistrement" });
  }
});

// Pour servir l'app React buildée
app.use(express.static(join(__dirname, "build")));
app.get('*', (req, res) => res.sendFile(join(__dirname, 'build', 'index.html')));

// Lancer le serveur
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
