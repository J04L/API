const bodyParser = require("body-parser")
const express = require("express")
const mongoose = require("mongoose")

//rutas del router
const usuariosRutas = require('./router/usuarios.js')
const habitacionesRutas = require('./router/habitaciones.js')
const reservasRutas = require('./router/reservas.js')
const app = express()

//midelware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//rutas de modulos
app.use('/usuarios', usuariosRutas)
app.use('/api', habitacionesRutas)
app.use('/img', express.static('img'))
app.use('/api/reservas',reservasRutas)

mongoose.connect('mongodb+srv://Joel:1234@cluster0.ysfuq.mongodb.net/HOTEL')
.then(console.log('Conexión BDD existosa'))
.catch(error => console.log('Error al intentar conectar con la BDD', error))

//prueba
app.get("/", (req, res) => {
    res.send('Api Funcionando')
})

app.listen(3036, () =>{
    console.log("Escuchando por el puerto http://localhost:3036")
})
