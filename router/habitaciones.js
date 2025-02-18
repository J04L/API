const router = require('express').Router()
const {Habitacion, TipoHabitacion} = require('../modules/habitaciones')
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "img/habitaciones/habCreadas"); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
  }
});

const upload = multer({ storage: storage });

//devuelve todas las habitaciones
router.get("/habitacion", async (req, res) =>{
    try{
      let { nombreTipo, precioMin, precioMax, cantHuespedes, disponible, pisoMin, pisoMax } = req.query;
      let filtro = {};

      // Filtrar por tipo de habitación
      if (nombreTipo) filtro["tipoHabitacion.nombreTipo"] = nombreTipo;

      // Filtrar por precio mínimo y máximo
      if (precioMin) filtro.precio = { $gte: parseFloat(precioMin) };
      if (precioMax) filtro.precio = { ...filtro.precio, $lte: parseFloat(precioMax) };

      // Filtrar por cantidad de huéspedes (adultos + menores)
      if (cantHuespedes) {
          cantHuespedes = parseInt(cantHuespedes);
          filtro.$expr = {
              $gte: [
                  { $add: ["$tipoHabitacion.capacidadPersonas.adultos", "$tipoHabitacion.capacidadPersonas.menores"] },
                  cantHuespedes
              ]
          };
      }
      // Filtrar por disponibilidad
      if (disponible !== undefined) filtro.disponible = disponible === "true";

      // Filtrar por rango de pisos
      if (pisoMin) filtro.piso = { $gte: parseInt(pisoMin) };
      if (pisoMax) filtro.piso = { ...filtro.piso, $lte: parseInt(pisoMax) };
        
        const habitaciones = await Habitacion.find(filtro)

        const baseurl = "http://localhost:3036/"
        habitaciones.forEach(habitacion =>{
          habitacion["fotos"] = habitacion["fotos"].map(url => baseurl + url)
        })
      
        res.status(200).json(habitaciones)
        
    }catch(error){
        res.status(400).json({message: 'Error al obtener habitaciones', error})
    }
})

//devuelve la habitacion del id en los parámetros
router.get("/habitacion/:id", async (req, res) =>{
    try{
        const habitacion = await Habitacion.findById(req.params.id)
        res.status(200).json(habitacion)

    }catch(error){
        res.status(400).json({message: 'Error al obtener habitacion', error})
    }
})

//crea una habitación
router.post("/habitacion",  upload.single("imagen"), async (req, res) =>{
    try{
        // Convertir el JSON recibido a objeto JavaScript
        let habitacionData = JSON.parse(req.body.habitacion);
        
        // Agregar las rutas de las imágenes al objeto antes de guardarlo
        let nuevaHabitacion = new Habitacion({
          numeroHabitacion: habitacionData.numeroHabitacion,
          tipoHabitacion: {
              nombreTipo: habitacionData.tipoHabitacion.nombreTipo,
              precioBase: habitacionData.tipoHabitacion.precioBase,
              capacidadPersonas: {
                  adultos: habitacionData.tipoHabitacion.capacidadPersonas.adultos,
                  menores: habitacionData.tipoHabitacion.capacidadPersonas.menores
              },
              capacidadCamas: habitacionData.tipoHabitacion.capacidadCamas
          },
          descripcion: habitacionData.descripcion,
          precio: habitacionData.precio,
          fotos: [req.file.path], // Aquí almacenamos las rutas de las imágenes subidas
          camas: {
              individual: habitacionData.camas.individual,
              doble: habitacionData.camas.doble
          },
          dimensiones: habitacionData.dimesiones, 
          disponible: habitacionData.disponible,
          piso: habitacionData.piso
      });
        // Guardar en MongoDB
        await nuevaHabitacion.save();
        res.status(200).json(nuevaHabitacion)
    }catch(error){
        res.status(400).json({message: 'Error al crear habitacion', error})
    }
})

//elimina la habitación especificada en los parámetros
router.delete("/habitacion/:numero", async (req, res) =>{
    try {
        const habitacion = await Habitacion.deleteOne(
          {numeroHabitacion: req.params.numero}
        )
        // Verificar si se eliminó correctamente
        if (resultado.deletedCount > 0) {
          res.json({ message: "Habitación eliminada correctamente" });
      } else {
          res.status(404).json({ message: "No se encontró la habitación" });
      }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
})
router.get('/habitacionPrecioMax', async (req, res) => {
  try{const PrecioMax = await Habitacion.aggregate([
    { $sort: { "precio": -1 } },
    { $limit: 1 },
  { $project: { _id: 0, "precio": 1 } }
  ])
  res.status(200).json(PrecioMax[0].precio)
}
  catch (error){
    res.status(400).json({ error: error.message })
  }
})
router.get('/habitacionPisoMax', async (req, res) => {
  try{const pisoMax = await Habitacion.aggregate([
    { $sort: { "piso": -1 } },
    { $limit: 1 },
  { $project: { _id: 0, "piso": 1 } }
  ])
  res.status(200).json(pisoMax[0].piso)
}
  catch (error){
    res.status(400).json({ error: error.message })
  }
})
//actualiza la habitación por el id del parámetro
router.put('/habitacion/:numero', async (req, res) => {
    try {
      const habitacion = await Habitacion.updateOne(
        {numeroHabitacion: req.params.numero},
        {$set: req.body}
      )
      console.log(habitacion)
      if (habitacion.modifiedCount > 0) {
        res.json({ message: "Habitación actualizada correctamente" });
    } else {
        res.status(404).json({ message: "No se encontró la habitación o no hubo cambios" });
    }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

//obtener tipos de habitaciones
router.get('/tipoHabitaciones', async (req, res) => {
  try{const TipoHabitaciones = await TipoHabitacion.find()
  res.status(200).json(TipoHabitaciones)}
  catch (error){
    res.status(400).json({ error: error.message })
  }
})
module.exports =router;