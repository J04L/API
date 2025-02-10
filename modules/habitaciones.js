const mongoose = require("mongoose")

//Tipo habitaion
const TipoHabitacionSchema = new mongoose.Schema({
    nombreTipo: {
        type: String,
        required: true
    },
    precioBase: {
        type: Number,
        required: true,
    },
    capacidadCamas:{
        type: Number,
        require: true,
    },
    capacidadPersonas:{
        adultos:{
            type: Number,
            require: true
        },
        menores:{
            type: Number,
            require: true
        }
    }
}, { _id: false, collection: 'TipoHabitaciones'});

//habitacion
const HabitacionSchema = new mongoose.Schema({
    numeroHabitacion: {
        type: Number,
        required: true,
        unique: true
    },
    tipoHabitacion: {
        type: TipoHabitacionSchema,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    fotos: {
        type: [String],
        default: []
    },
    camas: {
        individual:{
            type:Number,
            require: true
        },
        doble:{
            type:Number,
            require: true
        }
    },
    dimensiones: {
        type: Number,
        required: true,
        min: 0
    },
    disponible: {
        type: Boolean,
        default: true
    },
    piso: {
        type: Number,
        required: true,
        min: 0
    }
}, 
{ 
  collection: 'habitaciones'
});

const Habitacion = mongoose.model('Habitacion', HabitacionSchema);
const TipoHabitacion = mongoose.model('TipoHabitaciones', TipoHabitacionSchema)
module.exports = {Habitacion, TipoHabitacion}