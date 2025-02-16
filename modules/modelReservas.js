const mongoose = require("mongoose");
const { Habitacion } = require("./habitaciones.js"); // Ajusta la ruta si es necesario

const modelRerservasApp = new mongoose.Schema({
    n_habitacion: {
        required: true,
        type: String, // Asegura que coincida con Habitacion.numeroHabitacion
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
    camaExtra: {
        required: false, // Corregido
        type: Boolean,
    },
    notificar: {
        required: false, // Corregido
        type: Boolean,
    }
});

// Pre-save hook para calcular totalDias automáticamente
modelRerservasApp.pre("save", function (next) {
    this.totalDias = Math.ceil((this.f_Final - this.f_Inicio) / (1000 * 60 * 60 * 24));
    next();
});

module.exports = mongoose.model("reservas", modelRerservasApp);
