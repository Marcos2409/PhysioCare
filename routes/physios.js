const express = require("express");

let Physio = require("../models/physio.js");
let router = express.Router();
const { authorize } = require("../auth/auth.js");
const bcrypt = require("bcrypt");
const User = require("../models/user.js"); // Ensure the path is correct
const Patient = require("../models/patient.js"); // Ensure the path is correct



//Get all physios
router.get("/", authorize(["admin", "physio", "patient"]), (req, res) => {
  Physio.find()
    .then((result) => {
      if (result.length === 0) {
        return res
          .status(404)
          .send({ error: "No physio registered", result: null });
      }
      return res.status(200).send({ result: result });
    })
    .catch((error) => {
      return res.status(500).send({ error: "Server error", result: null });
    });
});

//Get Physio by specialty
router.get("/find", authorize(["admin", "physio", "patient"]), (req, res) => {
  const { specialty } = req.query;

  if (!specialty) {
    Physio.find()
      .then((result) => {
        if (result.length === 0) {
          return res
            .status(404)
            .send({ error: "No physio registered", result: null });
        }
        return res.status(200).send({ result: result });
      })
      .catch((error) => {
        return res.status(500).send({ error: "Server error", result: null });
      });
  }

  Physio.find({ specialty: { $regex: specialty } })
    .then((result) => {
      if (result.length === 0) {
        return res.status(404).send({
          error: "No physio found with given specialty",
          result: null,
        });
      }
      return res.status(200).send({ result: result });
    })
    .catch((error) => {
      return res.status(500).send({ error: "Server error", result: null });
    });
});

//Get physio by ID
router.get("/:id", authorize(["admin", "physio", "patient"]), (req, res) => {
  Physio.findById(req.params.id)
    .then((result) => {
      if (result.length === 0) {
        return res
          .status(404)
          .send({ error: "No physio found with given ID", result: null });
      }
      return res.status(200).send({ result: result });
    })
    .catch((error) => {
      return res.status(500).send({ error: "Server error", result: null });
    });
});

// Insert physio
router.post("/", authorize(["admin"]), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      login: req.body.login,
      password: hashedPassword,
      rol: "physio",
    });
    const auxUser = await newUser.save();

    const physioInfo = req.body;
    const newPhysio = new Physio({
      _id: auxUser._id,
      ...physioInfo,
    });

    const result = await newPhysio.save();

    return res.status(201).send({ result });
  } catch (error) {
    return res.status(400).send({ error: "Error adding physio" + error});
  }
});

//Update physio data
router.put("/:id", authorize(["admin"]), async (req, res) => {
  const newData = req.body;

  const updateData = {
    ...newData,
  };

  try {
    const result = await Physio.findByIdAndUpdate(req.params.id, updateData);

    if (!result) {
      return res.status(400).send({ error: "Physio not found or invalid data" });
    }    

    return res.status(200).send({ result: result });
  } catch (error) {
    return res.status(500).send({ error: "Server error" });
  }
});


// Delete physio by ID
router.delete("/:id", authorize(["admin"]), (req, res) => {
  Physio.findByIdAndDelete(req.params["id"])
    .then((result) => {
      if (result) res.status(200).send({ result: result });
      else res.status(400).send({ error: "Physio not found" });
    })
    .catch((error) => {
      return res.status(400).send({ error: "Error removing Physio" });
    });
});

module.exports = router;
