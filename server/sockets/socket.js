const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades')

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

        callback( personas);
    });

    //Enviar mensaje a todo el grupo
    client.on('crearMensaje', (data) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje( persona.nombre, data.mensaje);
        client.broadcast.emit('crearMensaje', mensaje)
    });

    //Resolver el problema de la duplicidad de los usuarios
    client.on('disconnect', () =>{

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.emit('crear mensaje', crearMensaje('Administrador', `${ personaBorrada.nombre } salió`));
        client.broadcast.emit('listaPersona', usuarios.getPersonas() );


    });

});