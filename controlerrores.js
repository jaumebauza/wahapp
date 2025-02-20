function handleErrorCargarChats(error) {
    console.error('Error al cargar los chats:', error);
    alert('Hubo un error al cargar los chats. Por favor, intenta nuevamente.');
}

function handleErrorCargarMensajes(error) {
    console.error('Error al cargar los mensajes:', error);
    alert('Hubo un error al cargar los mensajes. Por favor, intenta nuevamente.');
}

function handleErrorEnviarMensaje(error) {
    console.error('Error al enviar el mensaje:', error);
    alert('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.');
}

function handleErrorMarcarComoLeido(error) {
    console.error('Error al marcar los mensajes como leídos:', error);
    alert('Hubo un error al marcar los mensajes como leídos. Por favor, intenta nuevamente.');
}

function handleErrorObtenerUsuariosYGrupos(error) {
    console.error('Error al obtener usuarios y grupos:', error);
    alert('Hubo un error al obtener usuarios y grupos. Por favor, intenta nuevamente.');
}

function handleErrorAñadirUsuarioAGrupo(error) {
    console.error('Error al añadir usuario al grupo:', error);
    alert('Hubo un error al añadir usuario al grupo. Por favor, intenta nuevamente.');
}

function handleErrorVerMiembrosGrupo(error) {
    console.error('Error al ver miembros del grupo:', error);
    alert('Hubo un error al ver los miembros del grupo. Por favor, intenta nuevamente.');
}

function handleErrorAbandonarGrupo(error) {
    console.error('Error al abandonar el grupo:', error);
    alert('Hubo un error al abandonar el grupo. Por favor, intenta nuevamente.');
}

function handleErrorCrearGrupo(error) {
    console.error('Error al crear el grupo:', error);
    alert('Hubo un error al crear el grupo. Por favor, intenta nuevamente.');
}

module.exports = {
    handleErrorCargarChats,
    handleErrorCargarMensajes,
    handleErrorEnviarMensaje,
    handleErrorMarcarComoLeido,
    handleErrorObtenerUsuariosYGrupos,
    handleErrorAñadirUsuarioAGrupo,
    handleErrorVerMiembrosGrupo,
    handleErrorAbandonarGrupo,
    handleErrorCrearGrupo
};