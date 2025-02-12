const bodyParser = require("body-parser")
const express = require("express")
const mongoose = require("mongoose")
const habitacionesRutas = require('./router/habitaciones.js')

const app = express()

//midelware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//rutas de habitacion
app.use('/api', habitacionesRutas)
app.use('/img', express.static('img'))

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
