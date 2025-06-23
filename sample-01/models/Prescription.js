// models/Prescription.js
const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
  auth0_id:       { type: String, required: true },
  user_email:     { type: String, required: true }, // déjà chiffré
  medication_name:{ type: String, required: true },
  dosage_quantity:{ type: Number, required: true },
  dosage_frequency:{ type: String, required: true },
  dosage_duration:{ type: String, required: true },
  start_date:     { type: Date,   required: true },
  end_date:       { type: Date,   required: true },
  notes:          { type: String },
  reminder_time: { type: String, required: true },  // format "HH:mm"

}, { timestamps: true });

module.exports = mongoose.model("Prescription", PrescriptionSchema);
