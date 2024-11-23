const express = require("express");

let Patient = require("../models/patient.js");
let router = express.Router();
let User = require("../models/user.js");
const { authorize } = require("../auth/auth.js");
const bcrypt = require("bcrypt");



//Get all patients
router.get("/", authorize(["admin", "physio"]), (req, res) => {
  Patient.find()
    .then((result) => {
      if (result.length === 0) {
        return res
          .status(404)
          .send({ error: "No patients registered", result: null });
      }
      return res.status(200).send({ result: result });
    })
    .catch((error) => {
      return res.status(500).send({ error: "Server error", result: null });
    });
});

//Get patient by surname (partial)
router.get("/find", authorize(["admin", "physio"]), (req, res) => {
  const { surname } = req.query;

  if (!surname) {
    Patient.find()
      .then((result) => {
        if (result.length === 0) {
          return res
            .status(404)
            .send({ error: "No patients registered", result: null });
        }
        return res.status(200).send({ result: result });
      })
      .catch((error) => {
        return res.status(500).send({ error: "Server error", result: null });
      });
  }

  Patient.find({ surname: { $regex: surname, $options: "i" } })
    .then((result) => {
      if (result.length === 0) {
        return res
          .status(404)
          .send({ error: "No patient found with given surname", result: null });
      }
      return res.status(200).send({ result: result });
    })
    .catch((error) => {
      return res.status(500).send({ error: "Server error", result: null });
    });
});

//Get patient by ID
router.get("/:id", authorize(["admin", "physio", "patient"]), (req, res) => {

  const { id: userId, rol: rol } = req.user;

  Patient.findById(req.params.id)
    .then((result) => {
      if (rol === 'patient' && req.params.id !== userId){
        return res.status(403).send({ error: "Forbidden. Patients can only see their own data" });
      }

      if (!result) {
        return res
          .status(404)
          .send({ error: "No patient found with given ID", result: null });
      }
      return res.status(200).send({ result: result });
    })
    .catch((error) => {
      return res.status(500).send({ error: "Server error", result: null });
    });
});

//Insert patient
router.post("/", authorize(["admin", "physio"]), async (req, res) => {
  try {
    const { login, password, ...patientInfo } = req.body;
    if (!login || !password) {
      return res.status(400).send({ error: "Login and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      login,
      password: hashedPassword,
      rol: "patient",
    });
    const savedUser = await newUser.save();

    console.log(savedUser._id);
    const newPatient = new Patient({
      _id: savedUser._id,
      ...patientInfo,
    });
    const result = await newPatient.save();

    return res.status(201).send({ result });
  } catch (error) {
    return res.status(500).send({ error: "Error adding patient." });
  }
});


// Update patient data
router.put("/:id", authorize(["admin", "physio"]), (req, res) => {
  const updateData = {
    name: req.body.name,
    surname: req.body.surname,
    birthDate: req.body.birthDate,
    address: req.body.address,
    insuranceNumber: req.body.insuranceNumber,
  };

  Patient.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then((result) => {
      if (!result) {
        return res.status(400).send({ error: "Error updating patient data" });
      }
      return res.status(200).send({ result: result });
    })
    .catch((error) => {
      return res.status(500).send({ error: "Server error" });
    });
});

// Delete patient by ID
router.delete("/:id", authorize(["admin", "physio"]), (req, res) => {
  Patient.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (result) res.status(200).send({ result: result });
      else return res.status(400).send({ error: "Patient not found" });
    })
    .catch((error) => {
      return res.status(400).send({ error: "Error removing patient" });
    });
});

module.exports = router;
