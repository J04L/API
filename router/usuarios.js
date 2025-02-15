const router = require('express').Router()
const usuario = require('../modules/usuarios')

router.get("/users", async (req, res) =>{
    try{
        const usuarios = await usuario.find()
        console.log(usuarios)

        res.status(200).json(usuarios)
    }catch(error){
        res.status(400).json({message: 'Error al obtener usuarios', error})
    }
});

// Endpoint de login
router.post('/login', async (req, res) => {
    try {
        // Validaciones
        if (!req.body || !req.body.email || !req.body.password) {
            return res.status(400).json({ error: "Email y contraseña son requeridos" });
        }

        const user = await usuarios.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña no válida' });
        }

        if (user.role !== 'Administrador' && user.role !== 'Empleado') {
            return res.status(403).json({ error: 'Acceso denegado. Solo los Empleados/Administradores pueden iniciar sesión.' });
        }

        // ✅ Si pasa todas las validaciones, se devuelve el usuario (sin la contraseña)
        const { password, ...userData } = user.toObject();  // Elimina la contraseña de la respuesta
        return res.status(200).json({ message: 'Login exitoso', user: userData });

    } catch (error) {
        console.error("Error en /login:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
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
        const guardarUsuario = await nuevoUsuario.save();
        res.status(200).json(guardarUsuario);
        console.log('Guardado con exito');
    } catch (error) {
        console.error("Error al crear usuario:", error);  // Imprime el error en el servidor
        res.status(400).json({ message: 'Error al crear usuarios', error });
    }
});

router.post('/getOne', async (req, res) => {
    try {
        const user = req.body.username;  // Aquí deberías usar req.query o req.params si es un GET
        const usuariosDB = await ModelUser.find({ email: user });
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
        const condiciones = {};

        // Búsqueda exacta
        if (req.body.username) condiciones.username = req.body.username;
        if (req.body.password) condiciones.password = req.body.password;
        if (req.body.role) condiciones.role = req.body.role;
        if (req.body.sex) condiciones.sex = req.body.sex;

        // Búsqueda parcial (case-insensitive)
        if (req.body.nombre) condiciones.nombre = { $regex: req.body.nombre, $options: 'i' };
        if (req.body.email) condiciones.email = { $regex: req.body.email, $options: 'i' };

        // Fecha exacta o búsqueda por rango de fechas
        if (req.body.birthday) {
            if (typeof req.body.birthday === 'object' && req.body.birthday.start && req.body.birthday.end) {
                condiciones.birthday = { $gte: new Date(req.body.birthday.start), $lte: new Date(req.body.birthday.end) };
            } else {
                condiciones.birthday = new Date(req.body.birthday);
            }
        }

        // Consulta a la base de datos
        const data = await ModelUser.find(condiciones);
        if (data.length === 0) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.patch("/update", async (req, res) => {
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
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(password, salt);
      }
  

      // Actualizamos el usuario usando el _id
      const usuario = await usuarios.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true } // Devuelve el documento actualizado
      );
  
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
        
      }
  
      // Responde con el usuario actualizado
      res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/delete", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "El email es requerido" });
        }

        const resultado = await ModelUser.deleteOne({ email });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports =router;