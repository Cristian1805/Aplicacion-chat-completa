const { io } = require('../server');

const { Usuarios } = require('../classes/usuarios');

const usuarios = new Usuarios();


io.on('connection', (client) => {

    client.on('Entrar al chat' , (data, callback) => {

        if (! data.nombre ){
            return callback({
                error: true,
                mensaje: 'El nombre es necesario'
            });
        }

        let personas = usuarios.agregarPersona( client.id, data.nombre);

        client.broadcast.emit('listaPersona', usuarios.getPersonas() );

        callback( personas );
    })

    //Resolver el problema de la duplicidad de los usuarios
    client.on('disconnect', () =>{

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.emit('Crear mensaje', {usuario: 'Administrador', mensaje: `${ personaBorrada } abandono el chat`});
        client.broadcast.emit('listaPersona', usuarios.getPersonas() );


    });

});