const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades')

const usuarios = new Usuarios();


io.on('connection', (client) => {

    client.on('Entrar al chat' , (data, callback) => {

        if (! data.nombre || !data.sala ){
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }

        client.join(data.sala);

        let personas = usuarios.agregarPersona( client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSalsa(data.sala));

        callback( personas);
    });

    //Enviar mensaje a todo el grupo
    client.on('crearMensaje', (data) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje( persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)
    });

    //Resolver el problema de la duplicidad de los usuarios
    client.on('disconnect', () =>{

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to('personaBorrada.sala').emit('crearMensaje', crearMensaje ('Administrador', `${ personaBorrada.nombre } salió`));
        client.broadcast.to('personaBorrada.sala').emit('listaPersona', usuarios.getPersonasPorSalsa(personaBorrada.sala) );


    });

    //Mensajes privados
    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.para).emit ('mensajePrivado ', crearMensaje(persona.nombre, data.mensaje ));

    });

});