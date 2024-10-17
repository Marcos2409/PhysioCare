const mongoose = require('mongoose');

/* date: de tipo fecha, obligatorio.
• physio: referencia al ID del fisoterapeuta, obligatorio.
• diagnosis: de tipo string, obligatorio. Debe tener una longitud mínima de 10
caracteres y una longitud máxima de 500 caracteres.
• treatment: de tipo string, obligatorio.
• observations: de tipo string, opcional. Debe tener una longitud máxima de 500
caracteres.
 */
let appointmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    physio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Physio',
        required: true
    },
    diagnosis: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    treatment: {
        type: String,
        required: true
    },
    observations: {
        type: String,
        required: false,
        maxlength: 500
    }
});

// Definición del esquema de nuestra colección
let physioSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        require: true
    },
    medicalRecord: {
        type: String,
        required: false,
        maxlength: 1000
    },
    appointments: [appointmentSchema]
});

// Asociación con el modelo (colección contactos)
let Physio = mongoose.model('records', physioSchema);
module.exports = Physio;