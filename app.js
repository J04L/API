const bodyParser = require("body-parser")
const express = require("express")
const mongoose = require("mongoose")
require('dotenv').config();
const PORT = process.env.PORT;
const mongoString = process.env.DATABASE_URL;
const cors = require("cors");

//rutas del router
const usuariosRutas = require('./router/usuarios.js')
const habitacionesRutas = require('./router/habitaciones.js')
const reservasRutas = require('./router/reservas.js')
const app = express()

//midelware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

//rutas de modulos
app.use('/usuarios', usuariosRutas)
app.use('/api', habitacionesRutas)
app.use('/img', express.static('img'))
app.use('/api/reservas',reservasRutas)

mongoose.connect(mongoString)
.then(console.log('Conexión BDD existosa'))
.catch(error => console.log('Error al intentar conectar con la BDD', error))

//prueba
app.get("/", (req, res) => {
    res.send('Api Funcionando')
})

app.listen(3036, () =>{
    console.log(`Escuchando por el puerto ${PORT}`)
})
