const express = require('express');
const modelReservas = require('../modules/modelReservas.js');
const router = express.Router();
const { Habitacion } = require("../modules/habitaciones.js"); // Ajusta la ruta según tu proyecto
const nodemailer = require('nodemailer');
require('dotenv').config();
module.exports = router;

// Ruta para obtener todos los usuarios
router.get('/getAll', async (req, res) => {
    try {
        const data = await modelReservas.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener un usuario por nombre de usuario
router.post('/getOne', async (req, res) => {
    try {
        const user = req.body.username;  // Aquí deberías usar req.query o req.params si es un GET
        const usuariosDB = await modelReservas.findOne({ username: user });
        console.log(usuariosDB);

        if (!usuariosDB) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        res.status(200).json(usuariosDB);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/getFilter', async (req, res) => {
    try {
        // Construir el objeto de condiciones dinámicamente
        const condiciones = {};

        // Filtrar por cualquier campo que venga en el cuerpo de la petición
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] !== undefined && req.body[key] !== null) {
                condiciones[key] = req.body[key];
            }
        });

        // Buscar todas las reservas que coincidan con las condiciones
        const data = await modelReservas.find(condiciones);

        if (data.length === 0) {
            return res.status(404).json({ message: 'No se encontraron reservas con ese filtro' });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/new', async (req, res) => {
    const data = new modelReservas({
        n_habitacion: req.body.n_habitacion,
        tipo_habitacion: req.body.tipo_habitacion,
        f_Inicio: req.body.f_Inicio,
        f_Final: req.body.f_Final,
        totalDias: req.body.totalDias,
        huespedEmail: req.body.huespedEmail,
        huespedNombre: req.body.huespedNombre,
        huespedApellidos: req.body.huespedApellidos,
        huespedDni: req.body.huespedDni,
        trabajadorEmail: req.body.trabajadorEmail,
        numeroHuespedes: req.body.numeroHuespedes,
        precio_noche: req.body.precio_noche,
        precio_total: req.body.precio_total,
        cuna: req.body.cuna,
        camaExtra: req.body.camaExtra,
    });

    try {
        const dataToSave = await data.save();

        // Configurar transporte de nodemailer
        let transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER, // Usa variables de entorno
                pass: process.env.EMAIL_PASS  // Usa una contraseña de aplicaciones
            }
        });

        // Configurar email
        let mailOptions = {
            from: 'elibijpar@alu.edu.gva.es',
            to: req.body.huespedEmail,
            subject: 'Confirmación de Reserva',
            text: `Estimado/a ${req.body.huespedNombre} ${req.body.huespedApellidos},\n\n` +
                `Su reserva ha sido confirmada con los siguientes detalles:\n\n` +
                `Número de Habitación: ${req.body.n_habitacion}\n` +
                `Tipo de Habitación: ${req.body.tipo_habitacion}\n` +
                `Fecha de Entrada: ${req.body.f_Inicio}\n` +
                `Fecha de Salida: ${req.body.f_Final}\n` +
                `Número de Huéspedes: ${req.body.numeroHuespedes}\n` +
                `Precio por Noche: ${req.body.precio_noche}€\n` +
                `Precio Total: ${req.body.precio_total}€\n\n` +
                `Gracias por elegir nuestro hotel. Esperamos su visita.\n\n` +
                `Atentamente,\n` +
                `El equipo del hotel`
        };

        // Enviar email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error enviando correo:', error);
            } else {
                console.log('Correo enviado:', info.response);
            }
        });

        res.status(200).json(dataToSave);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



router.patch("/update", async (req, res) => { 
    try { 
        const { _id, n_habitacion, huespedEmail, huespedDni, f_Inicio, f_Final, ...updatedData } = req.body;

        // Verificar que haya al menos un criterio de búsqueda
        if (!_id && !n_habitacion && !huespedEmail && !huespedDni) {
            return res.status(400).json({ message: "Debe proporcionar _id, n_habitacion, huespedEmail o huespedDni para actualizar la reserva." });
        }

        // Construir el filtro dinámicamente
        const filtro = { 
            $or: [
                _id ? { _id } : null,
                n_habitacion ? { n_habitacion } : null,
                huespedEmail ? { huespedEmail } : null,
                huespedDni ? { huespedDni } : null
            ].filter(Boolean) // Elimina valores nulos para evitar errores
        };

        // Asegurar que `notificar` siempre se actualice a `true`
        updatedData.notificar = true;

        // Convertir n_habitacion a entero
const numeroHabitacionInt = parseInt(n_habitacion, 10);

// Verificar que el número de habitación exista en Habitaciones
const habitacionExistente = await Habitacion.findOne({ numeroHabitacion: numeroHabitacionInt });
if (!habitacionExistente) {
    return res.status(404).json({ message: `El número de habitación ${n_habitacion} no existe.` });
}

        // Verificar que las fechas no interfieran con reservas existentes
        if (f_Inicio && f_Final) {
            const reservasExistentes = await modelReservas.find({
                n_habitacion,
                f_Final: { $gte: new Date(f_Inicio) },
                f_Inicio: { $lte: new Date(f_Final) },
                _id: { $ne: _id }  // Asegurar que no sea la misma reserva que estamos actualizando
            });

            if (reservasExistentes.length > 0) {
                return res.status(400).json({ message: "Las nuevas fechas de reserva ya están ocupadas para esta habitación." });
            }
        }

        // Actualizar la reserva
        const resultado = await modelReservas.updateOne(filtro, { $set: updatedData }); 

        if (resultado.matchedCount === 0) { 
            return res.status(404).json({ message: "Reserva no encontrada." }); 
        }

        res.status(200).json({ message: "Reserva actualizada exitosamente." }); 
    } catch (error) { 
        res.status(400).json({ message: error.message }); 
    } 
});


   
router.delete('/delete', async (req, res) => {
    try {
        const { _id } = req.body;

        // Validar que se envió un _id
        if (!_id) {
            return res.status(400).json({ message: "Debe proporcionar un _id para eliminar la reserva." });
        }

        // Intentar eliminar la reserva
        const data = await modelReservas.deleteOne({ _id });

        if (data.deletedCount === 0) {
            return res.status(404).json({ message: "Reserva no encontrada." });
        }

        res.status(200).json({ message: `Reserva con _id ${_id} eliminada exitosamente.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/reservas', async (req, res) => {
    const { 
        n_habitacion, 
        f_Inicio, 
        f_Final, 
        numeroHuespedes, 
        precioMin, 
        precioMax, 
        precioNocheMin, 
        precioNocheMax 
    } = req.body;
  
    try {
        // Construcción de los filtros
        let filtros = {};
  
        // Filtrar por número de habitación
        if (n_habitacion) {
            filtros.n_habitacion = n_habitacion;
        }
  
        // Filtrar por fecha de inicio
        if (f_Inicio) {
            filtros.f_Inicio = { $gte: new Date(f_Inicio) };
        }
  
        // Filtrar por fecha de finalización
        if (f_Final) {
            filtros.f_Final = { $gte: new Date(f_Final) };
        }
  // Filtrar por precio total dentro de un rango
 
        // Filtrar por número de huéspedes
        if (numeroHuespedes) {
            filtros.numeroHuespedes = numeroHuespedes;
        }
        
  
        // Filtrar por precio total dentro de un rango
        if (precioMin || precioMax) {
            filtros.precio_total = {};
            if (precioMin) filtros.precio_total.$gte = precioMin;
            if (precioMax) filtros.precio_total.$lte = precioMax;
        }

        // Filtrar por precio por noche dentro de un rango
        if (precioNocheMin || precioNocheMax) {
            filtros.precio_noche = {};
            if (precioNocheMin) filtros.precio_noche.$gte = precioNocheMin;
            if (precioNocheMax) filtros.precio_noche.$lte = precioNocheMax;
        }
  
        // Intentar obtener las reservas que coincidan con los filtros
        const reservas = await modelReservas.find(filtros);
  
        // Si no se encuentran reservas, devolver un mensaje
        if (reservas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron reservas con esos filtros' });
        }
  
        // Si se encuentran reservas, devolverlas
        res.status(200).json(reservas);
        console.log(filtros);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error al obtener las reservas', error: error.message });
    }
    console.log("Fecha de inicio recibida:", req.body.f_Inicio);


});

router.post("/habitaciones/libres", async (req, res) => {
    try {
        console.log(req.body);
        const { capacidad, fecha_inicio, fecha_fin, tipo, vip, oferta, extras } = req.body;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: "Las fechas de entrada y salida son obligatorias." });
        }

        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);

        if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
            return res.status(400).json({ error: "Las fechas proporcionadas no son válidas." });
        }

        if (fechaInicio >= fechaFin) {
            return res.status(400).json({ error: "La fecha de entrada no puede ser posterior o igual a la de salida." });
        }

        // Obtener todas las reservas dentro del rango de fechas
        const reservasExistentes = await modelReservas.find({
            $or: [
                { f_Inicio: { $lt: fechaFin }, f_Final: { $gt: fechaInicio } },
                { f_Inicio: { $gte: fechaInicio, $lte: fechaFin } },
                { f_Final: { $gte: fechaInicio, $lte: fechaFin } }
            ]
        });

        // Extraer los números de habitación ocupados
        const habitacionesOcupadas = reservasExistentes.map(reserva => reserva.n_habitacion);

        let filtro = {};
        if (capacidad) {
            filtro["tipoHabitacion.capacidadPersonas.adultos"] = { $gte: capacidad };
        }
        if (tipo) {
            filtro["tipoHabitacion.nombreTipo"] = tipo;
        }
        if (extras?.cuna || extras?.camaExtra) {
            filtro.$or = [];
            if (extras.cuna) filtro.$or.push({ "camas.individual": { $gte: 1 } });
            if (extras.camaExtra) filtro.$or.push({ "camas.doble": { $gte: 1 } });
        }
        if (oferta) {
            filtro["precio"] = { $lte: 100 };
        }

        // Excluir habitaciones ocupadas en el rango de fechas
        filtro["numeroHabitacion"] = { $nin: habitacionesOcupadas };

        const habitacionesDisponibles = await Habitacion.find(filtro);
        res.json(habitacionesDisponibles);
    } catch (error) {
        console.error("Error al obtener habitaciones disponibles:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


router.post('/comprobar', async (req, res) => {
    const { f_Inicio, f_Final, tipo_habitacion } = req.body;

    try {
        // Convertir las fechas de inicio y fin a objetos Date
        const fechaInicio = new Date(f_Inicio);
        const fechaFinal = new Date(f_Final);

        // Verificar si las fechas son válidas
        if (isNaN(fechaInicio.getTime()) || isNaN(fechaFinal.getTime())) {
            return res.status(400).json({ message: "Las fechas proporcionadas no son válidas." });
        }

        // Buscar la primera habitación disponible que cumpla con las fechas
        const habitacionDisponible = await Habitacion.findOne({
            tipo_habitacion: tipo_habitacion,
            $or: [
                { f_Inicio: { $gt: fechaFinal } },  // Habitaciones disponibles después de la fecha de salida
                { f_Final: { $lt: fechaInicio } }   // Habitaciones disponibles antes de la fecha de entrada
            ]
        });

        if (habitacionDisponible) {
            return res.json(habitacionDisponible);
        } else {
            return res.status(404).json({ message: "No hay habitaciones disponibles en las fechas solicitadas" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error al comprobar disponibilidad", error });
    }
});













  

