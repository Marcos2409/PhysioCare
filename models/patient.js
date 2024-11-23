const mongoose = require('mongoose');

// Definición del esquema de nuestra colección
let patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    surname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    birthDate: {
        type: Date,
        required: true
    },
    address: {  
        type: String,
        required: false,
        maxlength: 100
    },
    insuranceNumber: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9]{9}$/,
        unique: true
    }
});

// Asociación con el modelo (colección contactos)
let Patient = mongoose.model('patients', patientSchema);
module.exports = Patient;