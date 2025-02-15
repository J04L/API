const mongoose = require("mongoose"); 
const UserSchema = new mongoose.Schema({ 

 nombre: { 
   qrequired: true, 
   type: String, 
 }, 
 apellido: { 
   required: true, 
   type: String, 
 },
 email: { 
   required: true, 
   type: String, 
 }, 
 dni: {
    required: true, 
    type: String, 
 },
 password: { 
    required: true, 
    type: String, 
    },
 birthday: { 
    required: true, 
    type: String, 
 },
 sex: { 
    required: true, 
    type: String, 
 },
 ciudad: {
    required: true,
    type: String,
 },
 vip:{
    required: true, 
    type: Boolean, 
 },
 role: {
    type: String,
    enum: ["Administrador","Empleado", "Cliente"], // Roles permitidos
    default: "Cliente", // Rol por defecto
 },   
 avatar: {
    type: String
 } 
}); 
module.exports = mongoose.model("usuarios", UserSchema); 