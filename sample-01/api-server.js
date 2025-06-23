const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();

const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");

const User = require("./models/User");
const Prescription = require("./models/Prescription");

const app = express();
app.use(express.json());

const port = process.env.API_PORT || 3001;
const appOrigin = authConfig.appOrigin || "http://localhost:3000";

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

// ====================== CHIFFREMENT EMAIL =========================
const SECRET_KEY = Buffer.from(process.env.SECRET_KEY, "hex"); // 32 bytes
const ALGORITHM = "aes-256-ctr";
const IV_LENGTH = 16; // 16 bytes

function encryptEmail(email) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(email, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decryptEmail(encryptedEmail) {
  const [ivHex, encryptedHex] = encryptedEmail.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
// ===============================================================

// Auth0 token validation
const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// ======================== ROUTES ============================

app.get("/api/external", checkJwt, (req, res) => {
  res.send({ msg: "✔️ Jeton Auth0 validé avec succès !" });
});

// Enregistrer un nouvel utilisateur
app.post("/save-user-info", checkJwt, async (req, res) => {
  const { firstname, lastname, age, poids, taille, rhesus, allergies, email, auth0_id } = req.body;
  try {
    const existing = await User.findOne({ auth0_id });
    if (existing) return res.status(200).send("Utilisateur déjà existant");

    const encryptedEmail = encryptEmail(email);
    const user = new User({
      firstname,
      lastname,
      age,
      poids,
      taille,
      rhesus,
      allergies,
      email: encryptedEmail,
      auth0_id
    });
    await user.save();
    return res.status(201).send("Utilisateur enregistré avec succès");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erreur serveur lors de l'enregistrement");
  }
});

// Récupérer les infos utilisateur par auth0_id
app.get("/get-user-info", checkJwt, async (req, res) => {
  const { auth0_id } = req.query;
  if (!auth0_id) return res.status(400).send("auth0_id requis");

  try {
    const user = await User.findOne({ auth0_id });
    if (!user) return res.status(404).send("Utilisateur non trouvé");

    const decryptedEmail = decryptEmail(user.email);
    const userData = { ...user._doc, email: decryptedEmail };
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Mettre à jour les infos utilisateur
app.put("/update-user-info", checkJwt, async (req, res) => {
  const { firstname, lastname, age, poids, taille, rhesus, allergies, email, auth0_id } = req.body;
  try {
    const encryptedEmail = encryptEmail(email);
    const result = await User.findOneAndUpdate(
      { auth0_id },
      { firstname, lastname, age, poids, taille, rhesus, allergies, email: encryptedEmail },
      { new: true }
    );
    if (!result) return res.status(404).send("Utilisateur introuvable pour mise à jour");
    res.status(200).send("Utilisateur mis à jour avec succès");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la mise à jour");
  }
});



// app.delete("/delete-user-info", checkJwt, async (req, res) => {
//   const { auth0_id } = req.query;
//   if (!auth0_id) return res.status(400).send("auth0_id requis");

//   try {
//     const result = await User.deleteOne({ auth0_id });
//     if (result.deletedCount === 0) {
//       return res.status(404).send("Aucun utilisateur trouvé à supprimer");
//     }
//     return res.status(200).send("Utilisateur supprimé avec succès");
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send("Erreur lors de la suppression");
//   }
// });

app.get("/get-prescriptions", checkJwt, async (req, res) => {
  const { auth0_id } = req.query;
  if (!auth0_id) return res.status(400).send("auth0_id requis");
  try {
    const docs = await Prescription.find({ auth0_id });
    return res.json(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erreur récupération");
  }
});

// POST save
app.post("/save-prescription", checkJwt, async (req, res) => {
  const {
    user_email,
    auth0_id,
    medication_name,
    dosage_quantity,
    dosage_frequency,
    dosage_duration,
    start_date,
    end_date,
    notes,
    // ajoute reminder_time ici
    reminder_time
  } = req.body;

  if (!user_email || !auth0_id || !reminder_time) {
    return res.status(400).send("user_email, auth0_id et reminder_time sont requis");
  }

  try {
    const encryptedEmail = encryptEmail(user_email);

    const prescription = new Prescription({
      auth0_id,
      user_email: encryptedEmail,
      medication_name,
      dosage_quantity,
      dosage_frequency,
      dosage_duration,
      start_date: new Date(start_date),
      end_date:   new Date(end_date),
      reminder_time,          // ← on le stocke
      notes
    });

    await prescription.save();
    return res.status(201).send("Prescription enregistrée");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erreur serveur lors de l'enregistrement");
  }
});


// PUT update
// PUT update-prescription
app.put("/update-prescription/:id", checkJwt, async (req, res) => {
  const { id } = req.params;
  const {
    user_email,
    medication_name,
    dosage_quantity,
    dosage_frequency,
    dosage_duration,
    start_date,
    end_date,
    notes,
    reminder_time  // ← on récupère aussi ici
  } = req.body;

  if (!reminder_time) {
    return res.status(400).send("reminder_time est requis");
  }

  try {
    const encrypted = encryptEmail(user_email);
    const updated = await Prescription.findByIdAndUpdate(
      id,
      {
        user_email:      encrypted,
        medication_name,
        dosage_quantity,
        dosage_frequency,
        dosage_duration,
        start_date:      new Date(start_date),
        end_date:        new Date(end_date),
        reminder_time,   // ← on met à jour
        notes
      },
      { new: true }
    );
    if (!updated) return res.status(404).send("Prescription introuvable");
    return res.send("Prescription mise à jour");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erreur mise à jour");
  }
});


// DELETE delete
app.delete("/delete-prescription/:id", checkJwt, async (req, res) => {
  const { id } = req.params;
  try {
    const d = await Prescription.findByIdAndDelete(id);
    if (!d) return res.status(404).send("Introuvable");
    return res.send("Supprimée");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erreur suppression");
  }
});
app.delete("/delete-user-info", checkJwt, async (req, res) => {
  const { auth0_id } = req.query;
  if (!auth0_id) {
    return res.status(400).send("auth0_id requis");
  }

  try {
    // 1) Supprimer toutes les prescriptions liées à ce user
    const presResult = await Prescription.deleteMany({ auth0_id });
    // 2) Supprimer l’utilisateur
    const userResult = await User.deleteOne({ auth0_id });

    return res.status(200).json({
      message: "Données utilisateur supprimées",
      prescriptionsDeleted: presResult.deletedCount,
      userDeleted: userResult.deletedCount,
    });
  } catch (err) {
    console.error("Erreur suppression RGPD :", err);
    return res.status(500).send("Erreur serveur lors de la suppression RGPD");
  }
});


app.listen(port, () => {
  console.log(`🚀 API Server listening on port ${port}`);
});
