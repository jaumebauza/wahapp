function handleErrorCargarChats(error) {
    console.error('Error al cargar los chats:', error);
    // Aquí puedes agregar más lógica para manejar este error, como mostrar un mensaje al usuario
}

function handleErrorCargarMensajes(error) {
    console.error('Error al cargar los mensajes:', error);
    // Aquí puedes agregar más lógica para manejar este error, como mostrar un mensaje al usuario
}

export { handleErrorCargarChats, handleErrorCargarMensajes };