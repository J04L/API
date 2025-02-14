const mongoose = require("mongoose");

const modelRerservasApp = new mongoose.Schema({
   
    n_habitacion: {
        required: true,
        type: String,
    },
    tipo_habitacion: {
        required: true,
        type: String,
    },
    f_Inicio: {
        required: true,
        type: Date,
    },
    f_Final: {
        required: true,
        type: Date,
    },
    
    totalDias: {
        required: true,
        type: Number,
    },
    huespedEmail: {
        required: true,
        type: String,
    },
    huespedNombre: {
        required: true,
        type: String,
    },
    huespedApellidos: {
        required: true,
        type: String,
    },
    huespedDni: {
        required: true,
        type: String,
    },
    trabajadorEmail: {
        required: true,
        type: String,
    },
   
    numeroHuespedes: {
        required: true,
        type: Number,
    },
    precio_noche: {
        required: true,
        type: Number,
    },
    
    precio_total: {
        required: true,
        type: Number,
    },
    cuna: {
        required: false,
        type: Boolean,
    },
    camaExtra:{
        require: false,
        type: Boolean,
    },
    notificar:{
        require: false,
        type: Boolean,
    }

    
});

module.exports = mongoose.model("reservas", modelRerservasApp);
