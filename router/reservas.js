const express = require('express');
const modelReservas = require('../modules/modelReservas.js');
const router = express.Router();

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
        camaExtra: req.camaExtra,
    })
    //console.log(req.body)
    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});



router.patch("/update", async (req, res) => { 
    try { 
        const { _id, n_habitacion, huespedEmail, huespedDni, ...updatedData } = req.body;

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

        // Buscar y actualizar la reserva
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



  

