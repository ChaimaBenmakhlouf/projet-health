const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    auth0_id: String,
    email: String, // Cet email sera chiffré
    firstname: String,
    lastname: String,
    age: Number,
    poids: Number,
    taille: Number,
    rhesus: String,
    allergies: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
