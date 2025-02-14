const express = require('express');
const router = express.Router();
const usuarios = require('../modules/usuarios'); // Importa el modelo correctamente
const mongoose = require('mongoose'); // Asegúrate de importar mongoose
const bcrypt= require('bcrypt');

// Obtener todos los usuarios
router.get("/users", async (req, res) => {
    try {
        const allUsers = await usuarios.find();
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(400).json({ message: 'Error al obtener usuarios', error });
    }
});

// Crear un nuevo usuario
router.post("/newUser", async (req, res) => {
    console.log("Request body:", req.body);

    try {
        let { password, ...userData } = req.body;
        if (!password) {
            return res.status(400).json({ message: "La contraseña es requerida" });
        }
        // Encripta la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crea el usuario con la contraseña encriptada
        const nuevoUsuario = new usuarios({
            ...userData,
            password: hashedPassword,
        });
        console.log("llega");
        const guardarUsuario = await nuevoUsuario.save();
        res.status(200).json(guardarUsuario);
        console.log("Usuario guardado con éxito");
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(400).json({ message: "Error al crear usuario", error });
    }
});

// Buscar usuario por email para login
router.post("/getOne", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) return res.status(400).json({ message: "El email es requerido" });

        const usuarioDB = await usuarios.findOne({ email });
        if (!usuarioDB) return res.status(404).json({ message: "Usuario no encontrado" });

        if (password) {
            // Verificación de contraseña
            const esCorrecta = await bcrypt.compare(password, usuarioDB.password);
            if (!esCorrecta) return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const { password: _, ...userData } = usuarioDB.toObject(); // Excluimos la contraseña
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Buscar usuario por ID
router.post("/getById", async (req, res) => {
    try {
        console.log(req.body);
        const { id } = req.body;

        const usuarioDB = await usuarios.findById(id);

        if (!usuarioDB) return res.status(404).json({ message: "Usuario no encontrado" });

        const { password: _, ...userData } = usuarioDB.toObject(); // Excluir contraseña
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Filtrar usuarios por diferentes criterios
router.post('/getFilter', async (req, res) => {
    try {
        const condiciones = {};

        if (req.body.role?.trim()) condiciones.role = req.body.role.trim();
        if (req.body.sex?.trim()) condiciones.sex = req.body.sex.trim();
        if (req.body.apellido?.trim()) condiciones.apellido = req.body.apellido.trim();
        if (req.body.nombre?.trim()) condiciones.nombre = { $regex: req.body.nombre.trim(), $options: 'i' };
        if (req.body.email?.trim()) condiciones.email = { $regex: req.body.email.trim(), $options: 'i' };
        if (req.body.vip?.trim()) condiciones.vip = { $regex: req.body.vip.trim(), $options: 'i'};
       

        if (req.body.birthday) {
            if (req.body.birthday.start && req.body.birthday.end) {
                condiciones.birthday = {
                    $gte: new Date(req.body.birthday.start),
                    $lte: new Date(req.body.birthday.end)
                };
            } else {
                const exactDate = new Date(req.body.birthday);
                if (!isNaN(exactDate)) {
                    condiciones.birthday = exactDate;
                }
            }
        }

        const data = await usuarios.find(condiciones);
        if (data.length === 0) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar usuario por username

router.post("/update/:id", async (req, res) => {

    try {
      const { id } = req.params; // El id del usuario a actualizar
      const {
        nombre,
        apellido,
        email,
        dni,
        password,
        birthday,
        sex,
        ciudad,
        vip,
        role,
        avatar
      } = req.body; // Extraemos todos los campos del cuerpo de la solicitud
  
      // Creamos un objeto de actualización con los campos recibidos
      const updateFields = {};
  
      if (nombre) updateFields.nombre = nombre;
      if (apellido) updateFields.apellido = apellido;
      if (email) updateFields.email = email;
      if (dni) updateFields.dni = dni;
      if (birthday) updateFields.birthday = birthday;
      if (sex) updateFields.sex = sex;
      if (ciudad) updateFields.ciudad = ciudad;
      if (vip !== undefined) updateFields.vip = vip; // El valor de vip es booleano
      if (role) updateFields.role = role;
      if (avatar) updateFields.avatar = avatar;
  
      // Verificamos si se proporciona una nueva contraseña
      if (password) {
        console.log("llega");
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(password, salt);
      }
  
      console.log('llega');

      // Actualizamos el usuario usando el _id
      const usuario = await usuarios.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true } // Devuelve el documento actualizado
      );

      console.log('llegaaaa');

  
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
        
      }
  
      // Responde con el usuario actualizado
      res.status(200).json(usuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


// Eliminar usuario por email
router.delete("/delete", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "El email es requerido" });
        }

        const resultado = await usuarios.deleteOne({ email });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
