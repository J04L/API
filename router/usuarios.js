const router = require('express').Router()
const usuario = require('../modules/usuarios')

router.get("/users", async (req, res) =>{
    try{
        const habitaciones = await usuario.find()
        console.log(habitaciones)

        res.status(200).json(this.usuario)
    }catch(error){
        res.status(400).json({message: 'Error al obtener usuarios', error})
    }
})

router.post("/newUser", async (req, res) =>{
    try{
        const nuevoUsuario = new usuario(req.body)
        const guardarUsuario = await nuevoUsuario.save()
        res.status(200).json(guardarUsuario)
    }catch(error){
        res.status(400).json({message: 'Error al crear usuarios', error})
    }
})

router.post('/getOne', async (req, res) => {
    try {
        const user = req.body.username;  // Aquí deberías usar req.query o req.params si es un GET
        const usuariosDB = await ModelUser.findOne({ username: user });
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
        // Construye el objeto de condiciones basado en los campos del json proporcionado
        const condiciones = {};
        if (req.body.nombre) condiciones.nombre = req.body.nombre;
        if (req.body.email) condiciones.email = req.body.email;
        if (req.body.username) condiciones.username = req.body.username;
        if (req.body.password) condiciones.password = req.body.password;
        if (req.body.role) condiciones.role = req.body.role;
        if (req.body.birthday) condiciones.birthday = req.body.birthday;
        if (req.body.sex) condiciones.sex = req.body.sex;


        const data = await ModelUser.find(condiciones);
        if (data.length === 0) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
})

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