const router = require('express').Router()
const {Habitacion, TipoHabitacion} = require('../modules/habitaciones')

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
        console.log(filtro, req.query)
        const habitaciones = await Habitacion.find(filtro)
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
router.post("/habitacion", async (req, res) =>{
    try{
        const nuevaHabitacion = new Habitacion(req.body)
        const guardarHabitacion = await nuevaHabitacion.save()
        res.status(200).json(guardarHabitacion)
    }catch(error){
        res.status(400).json({message: 'Error al crear habitacion', error})
    }
})

//elimina la habitación especificada en los parámetros
router.delete("/habitacion/:id", async (req, res) =>{
    try {
        const habitacion = await Habitacion.findByIdAndDelete(req.params.id);
        if (!habitacion) return res.status(404).json({ error: 'habitacion no encontrada' });
        res.status(200).json({ mensaje: 'habitacion eliminada correctamente' });
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
router.put('/habitacion/:id', async (req, res) => {
    try {
      const habitacion = await Habitacion.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // Devuelve el documento actualizado
      );
      if (!habitacion) return res.status(404).json({ error: 'habitacion no encontrada' });
      res.status(200).json(habitacion);
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