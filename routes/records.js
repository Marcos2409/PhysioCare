const express = require("express");

let Record = require("../models/record.js");
let router = express.Router();
const { authorize } = require("../auth/auth.js");
const bcrypt = require("bcrypt");

//Get all records
router.get("/", authorize(["admin", "physio"]), (req, res) => {
  Record.find()
    .then((result) => {
      if (result.length === 0) {
        return res
          .status(404)
          .send({ error: "No record registered", result: null });
      }
      return res.status(200).send({ result: result });
    })
    .catch((error) => {
      return res.status(500).send({ error: "Server error", result: null });
    });
});

//Get record by patient surname (partial)
router.get("/find", authorize(["admin", "physio"]), async (req, res) => {
  const { surname } = req.query;

  try {
    if (!surname) {
      return res.status(400).send({ error: "A surname is required" });
    }

    const patients = await Patient.find({
      surname: { $regex: surname, $options: "i" },
    });

    if (patients.length === 0) {
      return res.status(404).send({
        error: "No patients found with the given surname",
        result: null,
      });
    }

    const patientMatch = patients.map((patient) => patient._id);
    const records = await Record.find({ patient: { $in: patientMatch } });

    if (records.length === 0) {
      return res.status(404).send({
        error: "No records found for the given patients",
        result: null,
      });
    }

    return res.status(200).send({ result: records });
  } catch (error) {
    return res.status(500).send({ error: "Server error", result: null });
  }
});

//Get record by patient id
router.get("/:id", authorize(["admin", "physio"]), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).send({
        error: "Patient not found",
        result: null,
      });
    }

    const records = await Record.find({ patient });

    if (records.length === 0) {
      return res.status(404).send({
        error: "No records found for the given patient",
        result: null,
      });
    }

    return res.status(200).send({ result: records });
  } catch (error) {
    return res.status(500).send({
      error: "An error occurred while fetching records",
      details: error.message,
    });
  }
});

//Insert record
router.post("/", authorize(["admin", "physio"]), (req, res) => {
  let newRecord = new Record({
    patient: req.body.patient,
    medicalRecord: req.body.medicalRecord,
  });

  newRecord
    .save()
    .then((result) => {
      return res.status(201).send({ result: result });
    })
    .catch((error) => {
      return res.status(400).send({ error: "Error adding record" });
    });
});

//Insert appointment
router.post(
  "/:id/appointments",
  authorize(["admin", "physio"]),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);

      if (!patient) {
        return res.status(404).send({
          error: "Patient not found",
          result: null,
        });
      }

      const records = await Record.find({ patient });

      if (records.length === 0) {
        return res.status(404).send({
          error: "No records found for the given patient",
          result: null,
        });
      }

      let newAppointment = new Appointment({
        date: req.body.date,
        physio: req.body.physio,
        diagnosis: req.body.diagnosis,
        treatment: req.body.treatment,
        observations: req.body.observations,
        patient: req.body.patient,
      });

      newAppointment
        .save()
        .then((result) => {
          return res.status(201).send({ result: result });
        })
        .catch((error) => {
          return res.status(404).send({ error: "Not found" });
        });
    } catch (error) {
      return res.status(500).send({ error: "Server error" });
    }
  }
);

// Delete record by ID
router.delete("/:id", authorize(["admin", "physio"]), (req, res) => {
  Record.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (result) res.status(200).send({ result: result });
      else return res.status(404).send({ error: "Record not found" });
    })
    .catch((error) => {
      return res.status(500).send({ error: "Server error" });
    });
});

module.exports = router;
