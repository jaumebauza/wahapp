// Mostrar información del usuario logueado
function showLoggedInUser() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        console.log(`Sesión iniciada como: ${loggedInUser}`);
    } else {
        console.log('No has iniciado sesión.');
    }
}

// Llama a la función al cargar la página
window.onload = () => {
    showLoggedInUser();
    mostrarChats(); // Inicializa la lista de chats al cargar la página
};

// Función para cargar usuarios y grupos, y mostrarlos en la lista de chats
async function mostrarChats(filter = '') {
    try {
        const response = await fetch('http://localhost:8000/llistaamics'); // Cambia la URL según tu API
        if (!response.ok) throw new Error('Error al obtener los datos');

        const items = await response.json();

        // Filtrar los resultados
        const filteredItems = items.filter(item =>
            (item.username || item.nom).toLowerCase().includes(filter.toLowerCase())
        );

        // Limpiar la lista existente
        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = '';

        // Añadir los usuarios o grupos a la lista
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'chat-item';
            li.innerHTML = `
                <button class="chat-button" onclick="cargarChats('${item.type}', '${item.id}', '${item.username || item.nom}')">
                    <img src="desconocido.jpg" alt="Imagen de ${item.username || item.nom}">
                    <span class="username">${item.username || item.nom}</span>
                    <span class="type-label">${item.type === 'user' ? '👤' : '👥'}</span>
                </button>
            `;
            chatList.appendChild(li);
        });
    } catch (error) {
        console.error('Error al cargar los chats:', error);
    }
}

// Función para manejar la búsqueda
document.getElementById('search').addEventListener('input', (event) => {
    const filter = event.target.value;
    mostrarChats(filter);
});

// Función para cargar los mensajes de un usuario o grupo
function cargarChats(type, id, name) {
    const welcomeContainer = document.getElementById('welcome-container');
    welcomeContainer.innerHTML = `
        <div class="chat-header">
            <img src="desconocido.jpg" alt="Imagen de ${name}">
            <h2>${type === 'user' ? 'Usuario' : 'Grupo'}: ${name}</h2>
        </div>
        <div id="chat-messages">
            <p>Chat con ${type === 'user' ? 'usuario' : 'grupo'} "${name}"</p>
        </div>
        <div id="chat-input">
            <input type="text" id="message-input" placeholder="Escribe un mensaje...">
            <button onclick="enviarMensaje('${type}', '${id}', '${name}')">Enviar</button>
        </div>
    `;
}

// Función para enviar un mensaje (solo muestra en consola por ahora)
function enviarMensaje(type, id, name) {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message.trim() === '') {
        console.log('No puedes enviar un mensaje vacío.');
        return;
    }

    console.log(`Mensaje enviado a ${type}: ${name} (ID: ${id}) - Mensaje: ${message}`);
    messageInput.value = ''; // Limpiar el campo después de enviar
}
