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
})

router.post("/newUser", async (req, res) => {
    console.log("Request body:", req.body);  // Agrega esto para ver qué datos llegan
    try {
        const nuevoUsuario = new usuario(req.body);
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
        const { username, nombre, email, password, birthday, sex, ciudad, vip, role, avatar } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "El email es requerido" });
        }

        const updateFields = {};
        if (nombre) updateFields.nombre = nombre;
        if (email) updateFields.email = email;
        if (password) updateFields.password = password;
        if (birthday) updateFields.birthday = birthday;
        if (sex) updateFields.sex = sex;
        if (ciudad) updateFields.ciudad = ciudad;
        if (vip !== undefined) updateFields.vip = vip;
        if (role) updateFields.role = role;
        if (avatar) updateFields.avatar = avatar;

        const resultado = await ModelUser.updateOne(
            { username },
            { $set: updateFields }
        );

        if (resultado.modifiedCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado o datos sin cambios" });
        }

        res.status(200).json({ message: "Usuario actualizado exitosamente" });
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