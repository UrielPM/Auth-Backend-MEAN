
const { response } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');


const crearUsuario = async (req, res = response) => {


     const { email, name, password} = req.body;


     try {

    // verificar el Email
    const usuario = await Usuario.findOne({ email});

    if( usuario) {
        return res.status(400).json({
            ok:false,
            msg: ' El usuario ya existe con ese email'
        });
    }

    // Crear usuario con el modelo

    const dbUser = new Usuario( req.body);

     //Encriptar la contraseña
     const salt = bcrypt.genSaltSync();
     dbUser.password = bcrypt.hashSync( password, salt);

     //Generar el Token

     const token = await generarJWT( dbUser.uid, name);




     //Crear usuario de BD
    await dbUser.save();

     //Generar respuestas exitosa
     return res.status(201).json({
         ok: true,
         uid: dbUser.id,
         name,
         email,
         token
     });

         
     } catch (error) {

        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte al administrador'
        })
         
     }

}


const loginUsuario = async (req, res = response )=>{

    const { email, password } = req.body;

    try {

        const dbUser = await Usuario.findOne({ email});

        if ( !dbUser){
            return res.status(400).json({
                ok:false,
                msg: 'El correo no existe'
            });

        }

        //Confirmar si el password hace match

        const validadPassword = bcrypt.compareSync( password, dbUser.password);

        if ( !validadPassword){
            return res.status(400).json({
                ok:false,
                msg: ' El password no es Valido'
            });

        }

        // Generar el JWT
        const token = await generarJWT( dbUser.id, dbUser.name);

        //Respuesta del servicio
        return res.json({
            ok: true,
            uid: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            token

        });



        
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            ok: false,
            msg: 'Pongase en contacto con el Administrador'
        });
        
    }
    
}

const revalidarToken = async (req, res =  response ) => {

    const { uid } = req;

    //Leer la base de datos
    const dbUser = await Usuario.findById(uid);


    // Generar el JWT
    const token = await generarJWT( uid, dbUser.name);

    return res.json({
        ok: true,
        uid,
        name: dbUser.name,
        email: dbUser.email,
        token
    
    });
}



module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken

}