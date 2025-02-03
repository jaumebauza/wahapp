(function showLoggedInUser() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        document.getElementById("user-info").textContent = `Sesión iniciada como: ${loggedInUser}`;
    } else {
        document.getElementById("user-info").textContent = 'No has iniciado sesión.';
    }
})();

// Llama a la función al cargar la página
window.onload = showLoggedInUser;

// Función para cargar usuarios y grupos, y mostrarlos
const jwt_token = localStorage.getItem('jwt_token');  // Asegúrate de que el token esté guardado aquí

if (!jwt_token) {
    throw new Error('No JWT token found');
}

// Obtener el nombre de usuario del usuario logeado
const loggedInUsername = localStorage.getItem('username');

try {
    // Hacer fetch a la API para obtener usuarios y grupos
    const response = await fetch('http://localhost:8000/llistaamics', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt_token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Detalles del error:', errorData);  // Imprime los detalles del error devueltos por el servidor
        throw new Error('Error al obtener los datos');
    }

    // Convertir respuesta a JSON
    const items = await response.json();

    // Filtrar usuarios y grupos según el filtro (si hay uno) y excluir al usuario logeado
    const filteredItems = items.filter(item =>
        (item.username || item.nom).toLowerCase().includes(filter.toLowerCase()) &&
        item.username !== loggedInUsername
    );

    // Limpiar la lista existente
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';

    // Mostrar los usuarios y grupos filtrados
    filteredItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item.username || item.nom;
        chatList.appendChild(listItem);
    });

} catch (error) {
    console.error('Error al cargar los chats:', error);
}


// Función para manejar la búsqueda
function handleSearch(event) {
    const filter = event.target.value; // Obtener el valor del input
    mostrarChats(filter); // Llamar a mostrarChats con el filtro aplicado
}

let welcome = document.getElementById('welcome-container');

// Función para cargar chats de un usuario o grupo
async function cargarChats(type, id, name) {
    const welcome = document.getElementById('welcome-container');
    welcome.innerHTML = ''; // Clear the welcome container

    const chatHeader = document.createElement('div');
    chatHeader.id = 'chat-header-new';

    const profilePic = document.createElement('img');
    profilePic.src = 'desconocido.jpg';
    profilePic.alt = `Imagen de ${name}`;
    profilePic.id = 'profile-pic-new';
    chatHeader.appendChild(profilePic);

    const chatUsername = document.createElement('h2');
    chatUsername.id = 'chat-username-new';
    chatUsername.textContent = name;
    chatHeader.appendChild(chatUsername);

    welcome.appendChild(chatHeader);

    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages-new';

    const chatInfo = document.createElement('p');
    chatInfo.textContent = `Chat con ${type === 'user' ? 'usuario' : 'grupo'} "${name}"`;
    chatMessages.appendChild(chatInfo);

    welcome.appendChild(chatMessages);

    const chatInput = document.createElement('div');
    chatInput.id = 'chat-input-new';

    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.id = 'message-input-new';
    messageInput.placeholder = 'Escribe un mensaje...';
    chatInput.appendChild(messageInput);

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Enviar';
    sendButton.onclick = () => enviarMensaje(type, id, name);
    chatInput.appendChild(sendButton);

    welcome.appendChild(chatInput);

    try {
        const response = await fetch(`http://localhost:8000/recibir_missatges?receptor=${id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const messages = await response.json();
        const messagesContainer = document.getElementById('chat-messages-new');
        messagesContainer.innerHTML = '';

        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            if (msg.emisor === localStorage.getItem("loggedInUser")) {
                messageElement.classList.add('sent');
            }
            messageElement.innerHTML = `
                <strong>${msg.emisor}</strong>: ${msg.missatge} <br>
                <small>${msg.data_hora}</small>
            `;
            messagesContainer.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Inicializar la lista de chats y asociar el buscador
document.addEventListener('DOMContentLoaded', () => {
    mostrarChats(); // Mostrar todos los usuarios y grupos al inicio

    // Asociar la barra de búsqueda
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', handleSearch);
});

// Función para enviar mensajes (pendiente de implementación)
function enviarMensaje(type, id, name) {
    console.log(`Mensaje enviado a ${type}: ${name} (ID: ${id})`);
    // Aquí puedes implementar la lógica para enviar mensajes
}
