const mongoose = require('mongoose');

// Definición del esquema de nuestra colección
let physioSchema = new mongoose.Schema({
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
    specialty: {
        type: String,
        required: true,
        enum: ['Sports', 'Neurological', 'Pediatric', 'Geriatric', 'Oncological']
    },
    licenseNumber: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9]{8}$/,
        unique: true
    }
});

// Asociación con el modelo (colección contactos)
let Physio = mongoose.model('physios', physioSchema);
module.exports = Physio;