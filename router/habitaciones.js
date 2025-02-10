const router = require('express').Router()
const {Habitacion, TipoHabitacion} = require('../modules/habitaciones')

//devuelve todas las habitaciones
router.get("/habitacion", async (req, res) =>{
    try{
        const habitaciones = await Habitacion.find()
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