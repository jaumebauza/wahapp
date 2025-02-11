// Mostrar usuario logueado
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwt_token"); // Usamos 'jwt_token' en lugar de 'accessToken'

    console.log("🔍 Token al cargar usuarios.html:", token);

    if (!token || token === "null") {
        console.warn("⚠️ No hay token, redirigiendo a login...");
        window.location.href = "login.html";
    } else {
        console.log("✅ Token válido, cargando usuarios...");
        showLoggedInUser(); // Mostrar el usuario logueado
        obtenerUsuariosYGrupos();
    }
});

function showLoggedInUser() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    
    if (userInfoElement) {
        userInfoElement.textContent = loggedInUser ? `Sesión iniciada como: ${loggedInUser}` : 'No has iniciado sesión.';
    } else {
        console.error("Elemento 'user-info' no encontrado.");
    }
}




// Llama a la función al cargar la página
window.onload = showLoggedInUser;
async function obtenerUsuariosYGrupos() {
    const token = localStorage.getItem("jwt_token"); // Usamos 'jwt_token' en lugar de 'accessToken'
    console.log("🔍 Token antes de la petición:", token);

    if (!token) {
        console.warn("⚠️ No hay token, redirigiendo a login...");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/llistaamics", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });

        if (response.status === 401) {
            console.warn("⚠️ Token inválido. Eliminándolo...");
            localStorage.removeItem("jwt_token");
            console.log("❌ Token después de eliminación:", localStorage.getItem("jwt_token"));
            window.location.href = "login.html";
            return;
        }

        const data = await response.json();
        console.log("✅ Usuarios y grupos obtenidos:", data);
    } catch (error) {
        console.error("❌ Error obteniendo usuarios y grupos:", error);
    }
}
// Función para cargar usuarios y grupos, y mostrarlos
async function mostrarChats(filter = '') {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        console.error("No hay token almacenado.");
        return;
    }

    try {
        // Obtener la lista de usuarios y grupos del servidor
        const response = await fetch("http://localhost:8000/llistaamics", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No autorizado.`);
        }

        // Convertir respuesta a JSON
        const items = await response.json();
        console.log("Lista de amigos y grupos:", items);

        // Verificar que items es un array
        if (!Array.isArray(items)) {
            console.error("Datos recibidos no son un array.");
            return;
        }

        // Filtrar usuarios y grupos según el filtro (si hay uno)
        const filteredItems = items.filter(item =>
            (item.username || item.nom).toLowerCase().includes(filter.toLowerCase())
        );

        // Obtener el contenedor de la lista de chats
        const chatList = document.getElementById('chat-list');
        if (!chatList) {
            console.error("No se encontró el elemento 'chat-list'.");
            return;
        }

        // Limpiar la lista existente
        chatList.innerHTML = '';

        // Añadir botón para crear nuevo grupo
        const newGroupButton = document.createElement('li');
        newGroupButton.className = 'chat-item';

        const newGroupButtonElement = document.createElement('button');
        newGroupButtonElement.className = 'new-group-button';
        newGroupButtonElement.textContent = 'Crear nuevo grupo +';
        newGroupButtonElement.onclick = cargarCrearGrupo;

        newGroupButton.appendChild(newGroupButtonElement);
        chatList.appendChild(newGroupButton);

        // Mostrar los usuarios y grupos filtrados
        filteredItems.forEach(item => {
            const chatItem = document.createElement('li');
            chatItem.className = 'chat-item';

            const chatButton = document.createElement('button');
            chatButton.className = 'chat-button';
            chatButton.onclick = () => cargarChats(item.type, item.id, item.username || item.nom);

            const profileImg = document.createElement('img');
            profileImg.src = 'desconocido.jpg';
            profileImg.alt = `Imagen de ${item.username || item.nom}`;
            chatButton.appendChild(profileImg);

            const usernameSpan = document.createElement('span');
            usernameSpan.className = 'username';
            usernameSpan.textContent = item.username || item.nom;
            chatButton.appendChild(usernameSpan);

            const typeLabelSpan = document.createElement('span');
            typeLabelSpan.className = 'type-label';
            typeLabelSpan.textContent = item.type === 'user' ? '👤' : '👥';
            chatButton.appendChild(typeLabelSpan);

            chatItem.appendChild(chatButton);
            chatList.appendChild(chatItem);
        });

    } catch (error) {
        console.error("Error al cargar los chats:", error);
    }
}

// Función para manejar la búsqueda
function handleSearch(event) {
    const filter = event.target.value; // Obtener el valor del input
    mostrarChats(filter); // Llamar a mostrarChats con el filtro aplicado
}

let welcome = document.getElementById('welcome-container');

// Función para cargar chats de un usuario o grupo
// Función para cargar chats de un usuario específico
// Función para cargar chats de un usuario o grupo
// Función para cargar chats de un usuario o grupo
async function cargarChats(type, id, name) {
    const welcome = document.getElementById('welcome-container');
    const chatContainer = document.querySelector('.chat-container');

    // Ocultar la lista de chats en móviles
    if (window.innerWidth <= 768) {
        chatContainer.classList.add('hide-on-mobile');
        welcome.classList.add('show-on-mobile');
        
        
    }

    welcome.innerHTML = ''; // Limpiar el contenedor del chat

    const loggedInUserId = localStorage.getItem("loggedInUser"); // Obtener el ID del usuario logueado

    if (!loggedInUserId) {
        console.error("No se encontró el ID del usuario logueado.");
        return;
    }

    // Crear cabecera del chat
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

    if (window.innerWidth <= 768) {
        // Botón para volver a la lista de chats en móviles
        const backButton = document.createElement('button');
        backButton.textContent = 'Volver';
        backButton.className = 'back-button';
        backButton.onclick = () => {
            welcome.innerHTML = ''; // Limpiar el chat
            welcome.classList.remove('show-on-mobile');
            chatContainer.classList.remove('hide-on-mobile');
        };
        chatHeader.appendChild(backButton);
    }
    
    

    if (type === "group") {
        // Contenedor para los botones
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        // Botón para ver miembros del grupo
        const verMiembrosButton = document.createElement('button');
        verMiembrosButton.textContent = 'Ver miembros';
        verMiembrosButton.className = 'group-button';
        verMiembrosButton.setAttribute('onclick', `verMiembrosGrupo(${id})`);
        buttonContainer.appendChild(verMiembrosButton);

        // Botón para añadir usuarios (solo para administradores)
        const añadirUsuarioButton = document.createElement('button');
        añadirUsuarioButton.textContent = 'Añadir usuarios';
        añadirUsuarioButton.className = 'group-button';
        añadirUsuarioButton.setAttribute('onclick', `añadirUsuarioAGrupo(${id})`);
        buttonContainer.appendChild(añadirUsuarioButton);

        // Botón para abandonar el grupo
        const abandonarGrupoButton = document.createElement('button');
        abandonarGrupoButton.textContent = 'Abandonar grupo';
        abandonarGrupoButton.className = 'group-button';
        abandonarGrupoButton.onclick = () => confirmarAbandonarGrupo(id);
        buttonContainer.appendChild(abandonarGrupoButton);

        chatHeader.appendChild(buttonContainer);
    }

    welcome.appendChild(chatHeader);

    // Contenedor de mensajes
    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages-new';
    welcome.appendChild(chatMessages);

        aplicarFondoChat();

    // Input para enviar mensajes
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

    // Cargar mensajes entre el usuario logueado y el usuario seleccionado
    try {
        const response = await fetch(`http://localhost:8000/recibir_missatges?receptor=${id}&emisor=${loggedInUserId}`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron obtener los mensajes.`);
        }

        const messages = await response.json();
        console.log("📩 Mensajes recibidos:", messages);

        chatMessages.innerHTML = ''; // Limpiar mensajes previos

        if (messages.length === 0) {
            chatMessages.innerHTML = "<p>No hay mensajes disponibles.</p>";
            return;
        }

        // Ordenar mensajes por fecha
        messages.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';

            // Verificar si el mensaje fue enviado por el usuario logueado
            const isSentByUser = msg.emisor == loggedInUserId;

            if (isSentByUser) {
                messageElement.classList.add('sent');
            } else {
                messageElement.classList.add('received');
            }

            messageElement.innerHTML = `
                <strong>${msg.emisor}</strong>: ${msg.missatge} <br>
                <small>${msg.data_hora}</small>
            `;
            chatMessages.appendChild(messageElement);
        });

        // Scroll to the bottom of the chat container
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error("❌ Error cargando mensajes:", error);
        chatMessages.innerHTML = `<p style="color:red;">Error cargando mensajes. Inténtalo de nuevo.</p>`;
    }
}


// Inicializar la lista de chats y asociar el buscador
document.addEventListener('DOMContentLoaded', () => {
    mostrarChats(); // Mostrar todos los usuarios y grupos al inicio
    cargarBienvenida(); // Mostrar la bienvenida inicial

    // Asociar la barra de búsqueda
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', handleSearch);
});

let añadirUsuarioMenuAbierto = false; // Variable de estado para controlar si el menú está abierto

async function añadirUsuarioAGrupo(grup_id) {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        console.error("No hay token almacenado.");
        return;
    }

    // Verificar si el menú ya está abierto
    const existingContainer = document.getElementById('añadir-usuario-container');
    if (existingContainer) {
        existingContainer.remove(); // Cerrar el menú si ya está abierto
        añadirUsuarioMenuAbierto = false;
        return;
    }

    try {
        // Obtener la lista de usuarios disponibles
        const response = await fetch(`http://localhost:8000/grups/${grup_id}/usuaris_disponibles`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No autorizado.`);
        }

        const usuarisDisponibles = await response.json();

        if (usuarisDisponibles.length === 0) {
            alert("No hay usuarios disponibles para añadir.");
            return;
        }

        // Crear un contenedor para el desplegable y el botón
        const container = document.createElement('div');
        container.id = 'añadir-usuario-container'; // Identificador único para el contenedor
        container.style.marginTop = '10px';

        // Crear un desplegable con los usuarios disponibles
        const select = document.createElement('select');
        select.id = 'usuarios-disponibles';

        usuarisDisponibles.forEach(usuari => {
            const option = document.createElement('option');
            option.value = usuari.id;
            option.textContent = usuari.username;
            select.appendChild(option);
        });

        // Crear un botón para confirmar la selección
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Añadir';
        confirmButton.style.marginLeft = '10px';
        confirmButton.onclick = async () => {
            const selectedUserId = select.value;
            if (!selectedUserId) {
                alert("Por favor, selecciona un usuario.");
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/grups/${grup_id}/afegir_usuari`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username: usuarisDisponibles.find(u => u.id == selectedUserId).username })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error ${response.status}: ${errorData.detail || "No autorizado"}`);
                }

                const result = await response.json();
                console.log("Usuari afegit:", result);
                alert("Usuari afegit correctament");
                window.location.reload(); // Recargar la página para actualizar la lista de miembros
            } catch (error) {
                console.error("Error al afegir usuari:", error);
                alert(`Error al afegir usuari: ${error.message}`);
            }
        };

        // Añadir el desplegable y el botón al contenedor
        container.appendChild(select);
        container.appendChild(confirmButton);

        // Insertar el contenedor debajo del botón "Añadir usuarios"
        const añadirUsuarioButton = document.querySelector(`button[onclick="añadirUsuarioAGrupo(${grup_id})"]`);
        if (!añadirUsuarioButton) {
            console.error("No se encontró el botón 'Añadir usuarios'.");
            return;
        }
        añadirUsuarioButton.insertAdjacentElement('afterend', container);

        // Actualizar el estado del menú
        añadirUsuarioMenuAbierto = true;
    } catch (error) {
        console.error("Error al obtener usuarios disponibles:", error);
        alert("Error al obtener usuarios disponibles.");
    }
}

// Función para mostrar los miembros del grupo en una lista


let verMiembrosMenuAbierto = false; // Variable de estado para controlar si el menú está abierto

async function verMiembrosGrupo(grup_id) {
    try {
        const token = localStorage.getItem("jwt_token");
        if (!token) {
            console.error("No hay token almacenado.");
            return;
        }

        // Verificar si el menú ya está abierto
        const existingContainer = document.getElementById('members-container');
        if (existingContainer) {
            existingContainer.remove(); // Cerrar el menú si ya está abierto
            return;
        }

        // Obtener los miembros del grupo
        const response = await fetch(`http://localhost:8000/grups/${grup_id}/membres`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No autorizado.`);
        }

        const membres = await response.json();
        console.log("Miembros del grupo:", membres);

        // Crear un contenedor para la lista de miembros
        const membersContainer = document.createElement('div');
        membersContainer.id = 'members-container';

        // Añadir cada miembro a la lista
        membres.forEach(membre => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';

            // Nombre del usuario en negrita
            const memberName = document.createElement('strong');
            memberName.textContent = `${membre.username} ${membre.es_admin ? '(Admin)' : ''}`;
            memberItem.appendChild(memberName);

            // Botón para hacer admin (solo visible para no administradores)
            if (!membre.es_admin) {
                const makeAdminButton = document.createElement('button');
                makeAdminButton.textContent = 'Hacer admin';
                makeAdminButton.onclick = async () => {
                    try {
                        const response = await fetch(`http://localhost:8000/grups/${grup_id}/fer_admin`, {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ usuari_id: membre.id }) // Asegúrate de que membre.id sea correcto
                        });

                        if (!response.ok) {
                            throw new Error(`Error ${response.status}: No autorizado.`);
                        }

                        const result = await response.json();
                        console.log("Usuari fet admin:", result);
                        alert("L'usuari ara és admin del grup");
                        window.location.reload(); // Recargar la página para actualizar la lista de miembros
                    } catch (error) {
                        console.error("Error al fer admin a l'usuari:", error);
                        alert("Error al fer admin a l'usuari");
                    }
                };

                memberItem.appendChild(makeAdminButton);
            }

            membersContainer.appendChild(memberItem);
        });

        // Insertar la lista de miembros en el documento
        document.body.appendChild(membersContainer);

    } catch (error) {
        console.error("Error al obtener los miembros del grupo:", error);
        alert("Error al obtener los miembros del grupo.");
    }
}

// Función para confirmar y abandonar un grupo
async function confirmarAbandonarGrupo(grup_id) {
    const confirmacio = confirm("Estàs segur que vols abandonar aquest grup?");
    if (!confirmacio) return;

    try {
        const response = await fetch(`http://localhost:8000/grups/${grup_id}/abandonar`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No autorizado.`);
        }

        const result = await response.json();
        console.log("Has abandonat el grup:", result);
        alert("Has abandonat el grup correctament");
        window.location.reload(); // Recargar la página para actualizar la lista de grupos
    } catch (error) {
        console.error("Error al abandonar el grup:", error);
        alert("Error al abandonar el grup");
    }
}

function cargarAjustes() {
    const welcome = $('#welcome-container');
    const chatContainer = $('.chat-container');

    // Ocultar la lista de chats en móviles
    if ($(window).width() <= 768) {
        chatContainer.addClass('hide-on-mobile');
        welcome.addClass('show-on-mobile');
    }

    welcome.html('');

    const ajustesContainer = $('<div>', { id: 'ajustes-container' }).css({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        position: 'relative',
        opacity: '0',
        transition: 'opacity 0.5s ease'
    });

    const backButton = $('<button>', { text: 'Volver', class: 'back-button2' }).on('click', () => {
        welcome.html('');
        welcome.removeClass('show-on-mobile');
        chatContainer.removeClass('hide-on-mobile');
        if ($(window).width() > 768) {
            cargarBienvenida();
        }
    });

    const darkModeButton = $('<button>', { text: 'Activar Modo Oscuro' }).css({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '50px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007bff',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
    }).hover(
        function() { $(this).css('backgroundColor', '#0056b3'); },
        function() { $(this).css('backgroundColor', '#007bff'); }
    ).on('click', toggleDarkMode);

    const highContrastButton = $('<button>', { text: 'Activar Alto Contraste' }).css({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#28a745',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
    }).hover(
        function() { $(this).css('backgroundColor', '#218838'); },
        function() { $(this).css('backgroundColor', '#28a745'); }
    ).on('click', toggleHighContrast);

    const changeBackgroundButton = $('<button>', { text: 'Cambiar Fondo' }).css({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#ffc107',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
    }).hover(
        function() { $(this).css('backgroundColor', '#e0a800'); },
        function() { $(this).css('backgroundColor', '#ffc107'); }
    ).on('click', mostrarDesplegableFondos);

    const logoutButton = $('<button>', { text: 'Cerrar Sesión' }).css({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#dc3545',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
    }).hover(
        function() { $(this).css('backgroundColor', '#c82333'); },
        function() { $(this).css('backgroundColor', '#dc3545'); }
    ).on('click', cerrarSesion);

    ajustesContainer.append(backButton, darkModeButton, highContrastButton, changeBackgroundButton, logoutButton);
    welcome.append(ajustesContainer);

    // Trigger the fade-in effect
    setTimeout(() => {
        ajustesContainer.css('opacity', '1');
    }, 0);
}

let fondoContainerExists = false;

function mostrarDesplegableFondos() {
    const existingContainer = $('#fondo-container');
    if (existingContainer.length) {
        existingContainer.remove(); // Si ya existe, lo eliminamos
        fondoContainerExists = false;
        return;
    }

    // Seleccionar el contenedor de ajustes
    const ajustesContainer = $('#ajustes-container');

    // Crear el contenedor del desplegable
    const fondoContainer = $('<div>', { id: 'fondo-container' }).css({
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    });

    // Crear el desplegable (select)
    const select = $('<select>', { id: 'fondo-select' }).css({
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '10px',
        fontSize: '16px'
    });

    // Obtener las imágenes disponibles desde el servidor
    $.get('http://localhost:8000/imagenes', function(imagenes) {
        // Añadir cada imagen como una opción en el desplegable
        imagenes.forEach(imagen => {
            select.append($('<option>', {
                value: imagen,
                text: imagen
            }));
        });

        // Crear el botón para aplicar el fondo seleccionado
        const confirmButton = $('<button>', { text: 'Aplicar Fondo' }).css({
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            border: 'none',
            marginBottom: '10px',
            borderRadius: '5px',
            backgroundColor: '#007bff',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease'
        }).hover(
            function() { $(this).css('backgroundColor', '#0056b3'); },
            function() { $(this).css('backgroundColor', '#007bff'); }
        ).on('click', function() {
            const selectedImage = select.val();
            cambiarFondoChat(selectedImage);
            localStorage.setItem('selectedBackgroundImage', selectedImage); // Guardar la imagen seleccionada
            fondoContainer.remove(); // Eliminar el desplegable después de aplicar el fondo
            fondoContainerExists = false;
            alert('Se ha cambiado el fondo correctamente');
        });

        // Crear el botón para restablecer el fondo a blanco
        const resetButton = $('<button>', { text: 'Restablecer Fondo' }).css({
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            border: 'none',
            marginBottom: '10px',
            borderRadius: '5px',
            backgroundColor: '#dc3545',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease'
        }).hover(
            function() { $(this).css('backgroundColor', '#c82333'); },
            function() { $(this).css('backgroundColor', '#dc3545'); }
        ).on('click', function() {
            cambiarFondoChat('');
            localStorage.removeItem('selectedBackgroundImage'); // Eliminar la imagen seleccionada
            fondoContainer.remove(); // Eliminar el desplegable después de restablecer el fondo
            fondoContainerExists = false;
            alert('Se ha restablecido el fondo a blanco');
        });

        // Añadir el desplegable y los botones al contenedor
        fondoContainer.append(select, confirmButton, resetButton);

        // Insertar el contenedor del desplegable justo debajo del botón "Cambiar Fondo"
        const changeBackgroundButton = $('button').filter(function() {
            return $(this).text() === 'Cambiar Fondo';
        });
        if (changeBackgroundButton.length) {
            changeBackgroundButton.after(fondoContainer);
        } else {
            ajustesContainer.append(fondoContainer); // Si no se encuentra el botón, añadirlo al contenedor de ajustes
        }

        fondoContainerExists = true; // Marcar que el desplegable está abierto
    }).fail(function(error) {
        console.error('Error al obtener las imágenes:', error);
    });
}

function cambiarFondoChat(imagen) {
    const chatMessages = $('#chat-messages-new');
    if (chatMessages.length) {
        chatMessages.css({
            backgroundImage: imagen ? `url('imagenes/${imagen}')` : 'none',
            backgroundColor: imagen ? 'transparent' : 'white',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
        });
    }
}

function aplicarFondoChat() {
    const selectedImage = localStorage.getItem('selectedBackgroundImage');
    if (selectedImage) {
        cambiarFondoChat(selectedImage);
    }
}

window.addEventListener('resize', () => {
    const welcome = document.getElementById('welcome-container');
    const chatContainer = document.querySelector('.chat-container');
    if (window.innerWidth > 768) {
        welcome.classList.remove('show-on-mobile');
        chatContainer.classList.remove('hide-on-mobile');
        cargarBienvenida(); // Mostrar la bienvenida en pantallas grandes
    }
});

function toggleDarkMode() {
    document.body.classList.add('transition');
    document.body.classList.toggle('dark-mode');
    setTimeout(() => document.body.classList.remove('transition'), 300);
}

function toggleHighContrast() {
    document.body.classList.add('transition');
    document.body.classList.toggle('high-contrast');
    setTimeout(() => document.body.classList.remove('transition'), 300);
}

if (window.innerWidth > 768) {
    function cargarBienvenida() {
        const welcome = document.getElementById('welcome-container');
        welcome.innerHTML = `
            <img src="whatsapp-logo.webp" alt="WhatsApp Logo" class="logo small-logo">
            <h1>¡Bienvenidos a Wahapp!</h1>
            <p>Selecciona un chat para comenzar a conversar.</p>
        `;
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
async function enviarMensaje(type, id, name) {
    const messageInput = document.getElementById('message-input-new');
    const messageText = messageInput.value.trim();

    if (!messageText) {
        console.warn("⚠️ No se puede enviar un mensaje vacío.");
        return;
    }

    const loggedInUser = localStorage.getItem("loggedInUser"); // Obtener el usuario logueado

    if (!loggedInUser) {
        console.error("No se encontró el usuario logueado.");
        return;
    }

    

    const token = localStorage.getItem("jwt_token"); // Obtener el token de autenticación

    try {
        const response = await fetch("http://localhost:8000/enviar_missatge", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                remitente: loggedInUser,
                destinatario: id.toString(), // Ensure destinatario is a string
                mensaje: messageText
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo enviar el mensaje.`);
        }

        const result = await response.json();
        console.log("✅ Mensaje enviado:", result);

        // Limpiar el input de mensaje
        messageInput.value = '';

        // Recargar los mensajes del chat
        cargarChats(type, id, name);

    } catch (error) {
        console.error("❌ Error enviando mensaje:", error);
    }
}

function cerrarSesion() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html"; // Redirigir a la página de inicio de sesión
}

function cargarBienvenida() {
    const welcome = document.getElementById('welcome-container');
    welcome.innerHTML = `
        <img src="whatsapp-logo.webp" alt="WhatsApp Logo" class="logo small-logo">
        <h1>¡Bienvenidos a Wahapp!</h1>
        <p>Selecciona un chat para comenzar a conversar.</p>
    `;
}
function cargarCrearGrupo() {
    const welcome = document.getElementById('welcome-container');
    const chatContainer = document.querySelector('.chat-container');

    // Ocultar la lista de chats en móviles
    if (window.innerWidth <= 768) {
        chatContainer.classList.add('hide-on-mobile');
        welcome.classList.add('show-on-mobile');
    }

    welcome.innerHTML = ''; // Limpiar el contenedor de bienvenida

    const header = document.createElement('div');
    header.className = 'header';

    // Botón para volver a la lista de chats en móviles
    const backButton = document.createElement('button');
    backButton.textContent = 'Volver';
    backButton.className = 'back-button';
    backButton.onclick = () => {
        welcome.innerHTML = ''; // Limpiar el formulario
        welcome.classList.remove('show-on-mobile');
        chatContainer.classList.remove('hide-on-mobile');
        if (window.innerWidth > 768) {
            cargarBienvenida(); // Mostrar la bienvenida en pantallas grandes
        }
    };
    header.appendChild(backButton);

    const title = document.createElement('h2');
    title.textContent = 'Añadir nuevo grupo';
    title.className = 'form-title';
    header.appendChild(title);

    welcome.appendChild(header);

    const form = document.createElement('form');
    form.id = 'crear-grupo-form';
    form.className = 'form-container';

    const nombreLabel = document.createElement('label');
    nombreLabel.textContent = 'Nombre del grupo:';
    nombreLabel.className = 'form-label';
    form.appendChild(nombreLabel);

    const nombreInput = document.createElement('input');
    nombreInput.type = 'text';
    nombreInput.id = 'nombre-grupo';
    nombreInput.required = true; // Campo obligatorio
    nombreInput.className = 'form-input';
    form.appendChild(nombreInput);

    const descripcionLabel = document.createElement('label');
    descripcionLabel.textContent = 'Descripción:';
    descripcionLabel.className = 'form-label';
    form.appendChild(descripcionLabel);

    const descripcionInput = document.createElement('textarea');
    descripcionInput.id = 'descripcion-grupo';
    descripcionInput.className = 'form-textarea';
    form.appendChild(descripcionInput);

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Crear grupo';
    submitButton.type = 'button';
    submitButton.className = 'form-submit-button';
    submitButton.onclick = crearGrupo;
    form.appendChild(submitButton);

    welcome.appendChild(form);
}

// Función para crear un nuevo grupo
async function crearGrupo() {
    const nombre = document.getElementById('nombre-grupo').value.trim();
    const descripcion = document.getElementById('descripcion-grupo').value.trim();

    if (!nombre) {
        alert("El nombre del grupo es obligatorio.");
        return;
    }

    const token = localStorage.getItem("jwt_token"); // Obtener el token JWT del localStorage

    if (!token) {
        alert("No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.");
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/crear_grup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Añadir el token JWT en los headers
            },
            body: JSON.stringify({ nom: nombre, descripcio: descripcion })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Grupo creado:', result);
        mostrarChats(); // Refrescar la lista de chats
        cargarBienvenida(); // Mostrar la pantalla de bienvenida
    } catch (error) {
        console.error('Error creando el grupo:', error);
        alert("Error al crear el grupo. Por favor, verifica tu conexión o intenta nuevamente.");
    }
}