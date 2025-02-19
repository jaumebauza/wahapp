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

function actualizarListaChats() {
    mostrarChats(); // Llamar a la función para mostrar los chats
}

// Función para actualizar los mensajes del chat actual periódicamente
function actualizarMensajesChatActual() {
    const chatHeader = document.getElementById('chat-header-new');
    if (chatHeader) {
        const type = chatHeader.getAttribute('data-type');
        const id = chatHeader.getAttribute('data-id');
        cargarMensajes(); // Llamar a la función para cargar los mensajes del chat actual
    }
}

// Inicializar la lista de chats y asociar el buscador
document.addEventListener('DOMContentLoaded', () => {
    mostrarChats(); // Mostrar todos los usuarios y grupos al inicio
    cargarBienvenida(); // Mostrar la bienvenida inicial

    // Asociar la barra de búsqueda
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', handleSearch);

    // Establecer intervalos para actualizar la lista de chats y los mensajes del chat actual
    setInterval(actualizarListaChats, 3000); // Actualizar la lista de chats cada 3 segundos
    setInterval(actualizarMensajesChatActual, 3000); // Actualizar los mensajes del chat actual cada 3 segundos
});

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

async function cargarChats(type, id, name) {
    const chatContainer = document.querySelector('.chat-container');
    const welcome = document.getElementById('welcome-container');

    if (window.innerWidth <= 768) {
        chatContainer.classList.add('hide-on-mobile');
        welcome.classList.add('show-on-mobile');
    }

    welcome.innerHTML = '';

    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        console.error("No se encontró el usuario logueado.");
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

    // Botón para marcar como leído
    const markAsReadButton = document.createElement('button');
    markAsReadButton.textContent = 'Marcar como leído';
    markAsReadButton.className = 'mark-as-read-button';
    markAsReadButton.style.marginLeft = '10px'; // Añadir margen izquierdo
    markAsReadButton.onclick = () => marcarChatComoLeido(type, id);
    chatHeader.appendChild(markAsReadButton);

    // Botón de volver en pantallas pequeñas
    if (window.innerWidth <= 768) {
        const backButton = document.createElement('button');
        backButton.textContent = 'Volver';
        backButton.className = 'back-button';
        backButton.onclick = () => {
            welcome.innerHTML = '';
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
    chatMessages.style.overflowY = 'auto';
    chatMessages.style.height = '70vh';
    chatMessages.style.touchAction = 'pan-y'; // Evita gestos de desplazamiento conflictivos
    welcome.appendChild(chatMessages);

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

    // Variables para la paginación
    let offset = 0;
    const limit = 10;
    let loading = false;

    async function cargarMensajes(more = false) {
        if (loading) return;
        loading = true;
    
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                console.error("No se encontró el token.");
                return;
            }
    
            const endpoint = type === 'group'
                ? `recibir_missatges_grup?id_grup=${id}&offset=${offset}&limit=${limit}`
                : `recibir_missatges?receptor=${id}&emisor=${loggedInUser}&offset=${offset}&limit=${limit}`;
    
            const response = await fetch(`http://localhost:8000/${endpoint}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudieron obtener los mensajes.`);
            }
    
            const messages = await response.json();
            console.log("📩 Mensajes recibidos:", messages);
    
            if (messages.length === 0 && offset === 0) {
                chatMessages.innerHTML = "<p>No hay mensajes disponibles.</p>";
                return;
            }
    
            const scrollHeightBefore = chatMessages.scrollHeight;
            const scrollBottomBefore = chatMessages.scrollTop;
    
            messages.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
    
            messages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.className = 'message';
    
                const isSentByUser = msg.emisor == loggedInUser;
                messageElement.classList.add(isSentByUser ? 'sent' : 'received');
    
                const formattedDate = msg.data_hora.replace('T', ' ');
                let estadoIcon = '';
    
                if (isSentByUser) {
                    estadoIcon = msg.estat === 'enviat' ? '✔️' : msg.estat === 'llegit' ? '✔️✔️' : '';
                }
    
                messageElement.innerHTML = `
                    <strong>${msg.emisor}</strong>: ${msg.missatge} <br>
                    <small>${formattedDate} ${estadoIcon}</small>
                `;
    
                if (more) {
                    chatMessages.prepend(messageElement);
                } else {
                    chatMessages.appendChild(messageElement);
                }
            });
    
            if (more) {
                chatMessages.scrollTop = scrollBottomBefore + (chatMessages.scrollHeight - scrollHeightBefore);
            } else {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
    
            offset += limit;
        } catch (error) {
            console.error("❌ Error cargando mensajes:", error);
        } finally {
            loading = false;
        }
    }

    cargarMensajes();
    setupScroll(chatMessages, cargarMensajes);

    function setupScroll(chatMessages, cargarMensajes) {
        let lastScrollTop = chatMessages.scrollTop; // Guardar posición inicial
    
        chatMessages.addEventListener("scroll", function () {
            if (chatMessages.scrollTop < lastScrollTop && chatMessages.scrollTop <= 10) {
                console.log("🔄 Cargando más mensajes...");
                cargarMensajes(true);
            }
            lastScrollTop = chatMessages.scrollTop;
        });
    
        chatMessages.addEventListener("touchmove", function () {
            if (chatMessages.scrollTop <= 10) {
                console.log("📲 Cargando más mensajes en móvil...");
                cargarMensajes(true);
            }
        });
    }
}







// Función para marcar todo el chat como leído
async function marcarChatComoLeido(type, id) {
    const token = localStorage.getItem("jwt_token");
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!token || !loggedInUser) {
        console.error("No se encontró el token o el usuario logueado.");
        return;
    }

    try {
        // Obtener el ID del usuario logueado
        const responseUser = await fetch("http://localhost:8000/obtener_id_usuario", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!responseUser.ok) {
            throw new Error("No se pudo obtener el ID del usuario logueado.");
        }

        const userData = await responseUser.json();
        const loggedInUserId = userData.id; // Suponiendo que el servidor devuelve { "id": 3 }

        const endpoint = type === 'group' 
            ? `marcar_mensajes_como_leidos_grup?id_grup=${id}` 
            : `marcar_mensajes_como_leidos`;

        const receptorId = parseInt(id, 10);  // Convertir `id` a número

        console.log(`📢 Usuario logueado: ${loggedInUser} (ID: ${loggedInUserId})`);
        console.log(`📢 ID del receptor: ${receptorId}`);

        // Crear el cuerpo de la solicitud basado en el tipo
        const body = type === 'group' 
            ? { id_grup: receptorId } 
            : { receptor: loggedInUserId, emisor: receptorId };  // Corregido: emisor y receptor invertidos

        console.log("📦 Enviando solicitud para marcar mensajes como leídos:", body);

        // Enviar la solicitud al endpoint correspondiente
        const response = await fetch(`http://localhost:8000/${endpoint}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron marcar los mensajes como leídos.`);
        }

        const result = await response.json();
        console.log("✅ Mensajes marcados como leídos:", result);

        // Recargar mensajes y actualizar la vista
        setTimeout(() => {
            cargarMensajes();  // Recargar mensajes después de la actualización

            // Actualizar la vista de los mensajes para marcar los leídos
            actualizarVistaMensajes(receptorId);  // Corregido: cambiar ID de receptor
        }, 500);

    } catch (error) {
        console.error("❌ Error marcando mensajes como leídos:", error);
    }
}














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
        const endpoint = type === 'group' ? "enviar_missatge_grup" : "enviar_missatge";
        const body = type === 'group' ? { id_grup: id, missatge: messageText } : { remitente: loggedInUser, destinatario: id.toString(), mensaje: messageText };

        const response = await fetch(`http://localhost:8000/${endpoint}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo enviar el mensaje.`);
        }

        const result = await response.json();
        console.log("✅ Mensaje enviado:", result);

        // Limpiar el input de mensaje
        messageInput.value = '';

        // Añadir el mensaje al chat
        const chatMessages = document.getElementById('chat-messages-new');
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.innerHTML = `
            <strong>${loggedInUser}</strong>: ${messageText} <br>
            <small>${new Date().toLocaleString()}</small>
        `;
        chatMessages.appendChild(messageElement);

        // Scroll to the bottom of the chat container
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error("❌ Error enviando mensaje:", error);
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
            verMiembrosMenuAbierto = false;
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

        // Obtener el usuario logueado
        const loggedInUser = localStorage.getItem("loggedInUser");

        // Crear un contenedor para la lista de miembros
        const membersContainer = document.createElement('div');
        membersContainer.id = 'members-container';

        // Añadir estilos al contenedor
        membersContainer.style.position = 'fixed';
        membersContainer.style.backgroundColor = '#fff';
        membersContainer.style.border = '1px solid #ccc';
        membersContainer.style.padding = '10px';
        membersContainer.style.zIndex = '1000';
        membersContainer.style.maxHeight = '300px';
        membersContainer.style.overflowY = 'auto';

        // Verificar el tamaño de la pantalla
        if (window.innerWidth <= 768) { // Pantalla pequeña (menos de 768px)
            membersContainer.style.top = '210px'; // Ajusta la posición vertical
            membersContainer.style.left = '75%'; // Centra horizontalmente
            membersContainer.style.transform = 'translateX(-50%)'; // Asegura el centrado
            
        } else { // Pantalla grande
            membersContainer.style.top = '120px';
            membersContainer.style.left = '87%';
            membersContainer.style.transform = 'translateX(-50%)';
        }

        // Añadir cada miembro a la lista
        membres.forEach(membre => {
            console.log("Miembro:", membre);  // Verificar si el id existe
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';

            const memberName = document.createElement('strong');
            memberName.textContent = `${membre.username} ${membre.es_admin ? '(Admin)' : ''}`;
            memberItem.appendChild(memberName);

            // Botón para hacer admin (solo para no admins)
            if (!membre.es_admin) {
                const makeAdminButton = document.createElement('button');
                makeAdminButton.textContent = 'Hacer admin';
                makeAdminButton.className = 'make-admin-button';

                makeAdminButton.onclick = async () => {
                    if (!membre.id || membre.id === 0) {
                        console.error("Error: No se encontró el ID del usuario.");
                        return;
                    }

                    // Enviar la solicitud para hacer admin al usuario
                    const response = await fetch(`http://localhost:8000/grups/${grup_id}/fer_admin`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ usuari_id: membre.id })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Error ${response.status}: ${errorData.detail || "No autorizado"}`);
                    }

                    const result = await response.json();
                    console.log("Usuari fet admin:", result);
                    alert("L'usuari ara és admin del grup");
                    window.location.reload(); // Recargar la página para actualizar la lista de miembros
                };

                memberItem.appendChild(makeAdminButton);
            }

            // Botón para quitar el rol de admin (solo para admins y no es el mismo usuario)
            if (membre.es_admin && membre.username !== loggedInUser) {
                const removeAdminButton = document.createElement('button');
                removeAdminButton.textContent = 'Quitar admin';
                removeAdminButton.className = 'remove-admin-button';

                removeAdminButton.onclick = async () => {
                    if (!membre.id || membre.id === 0) {
                        console.error("Error: No se encontró el ID del usuario.");
                        return;
                    }

                    // Enviar la solicitud para quitar el rol de admin
                    const response = await fetch(`http://localhost:8000/grups/${grup_id}/quitar_admin`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ usuari_id: membre.id })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Error ${response.status}: ${errorData.detail || "No autorizado"}`);
                    }

                    const result = await response.json();
                    console.log("Usuari ja no és admin:", result);
                    alert("L'usuari ja no és admin del grup");
                    window.location.reload(); // Recargar la página para actualizar la lista de miembros
                };

                memberItem.appendChild(removeAdminButton);
            }

            // Botón para eliminar usuario (solo para admins y no es el mismo usuario)
            if (membre.username !== loggedInUser) {
                const deleteUserButton = document.createElement('button');
                deleteUserButton.textContent = 'Eliminar usuario';
                deleteUserButton.className = 'delete-user-button';

                deleteUserButton.onclick = async () => {
                    if (!membre.id || membre.id === 0) {
                        console.error("Error: No se encontró el ID del usuario.");
                        return;
                    }

                    // Confirmar antes de eliminar
                    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar a ${membre.username} del grupo?`);
                    if (!confirmacion) return;

                    // Enviar la solicitud para eliminar al usuario
                    const response = await fetch(`http://localhost:8000/grups/${grup_id}/eliminar_usuario`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ usuari_id: membre.id })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Error ${response.status}: ${errorData.detail || "No autorizado"}`);
                    }

                    const result = await response.json();
                    console.log("Usuari eliminat del grup:", result);
                    alert("L'usuari ha sigut eliminat del grup");
                    window.location.reload(); // Recargar la página para actualizar la lista de miembros
                };

                memberItem.appendChild(deleteUserButton);
            }

            membersContainer.appendChild(memberItem);
        });

        // Insertar la lista de miembros en el documento
        document.body.appendChild(membersContainer);

        // Marcar que el menú está abierto
        // Marcar que el menú está abierto
        verMiembrosMenuAbierto = true;

        // Añadir un listener para cerrar la lista de miembros cuando se cambia de pestaña
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && verMiembrosMenuAbierto) {
                const existingContainer = document.getElementById('members-container');
                if (existingContainer) {
                    existingContainer.remove(); // Cerrar el menú si está abierto
                    verMiembrosMenuAbierto = false;
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Limpiar el listener cuando se cierra manualmente la lista de miembros
        const closeMenu = () => {
            const existingContainer = document.getElementById('members-container');
            if (existingContainer) {
                existingContainer.remove(); // Cerrar el menú si está abierto
                verMiembrosMenuAbierto = false;
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
        };

        // Añadir un botón para cerrar manualmente la lista de miembros
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cerrar';
        closeButton.className = 'close-button';
        closeButton.onclick = closeMenu;
        membersContainer.appendChild(closeButton);

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

    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    const fontSizeLabel = $('<label>', { text: 'Tamaño Mensajes:', for: 'font-size-select' }).css({
        marginTop: '20px',
        fontSize: '16px',
        fontWeight: 'bold'
    });
    const fontSizeSelect = $('<select>', { id: 'font-size-select' }).css({
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginTop: '10px',
        fontSize: '16px'
    }).append(
        $('<option>', { value: 'small', text: 'Small' }),
        $('<option>', { value: 'normal', text: 'Normal' }),
        $('<option>', { value: 'big', text: 'Big' }),
        $('<option>', { value: 'very-big', text: 'Very Big' })
    ).val(savedFontSize).on('change', ajustarTamanoFuente);

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

    ajustesContainer.append(backButton, darkModeButton, highContrastButton, changeBackgroundButton, fontSizeLabel, fontSizeSelect, logoutButton);
    welcome.append(ajustesContainer);

    // Trigger the fade-in effect
    setTimeout(() => {
        ajustesContainer.css('opacity', '1');
    }, 0);
}

function ajustarTamanoFuente() {
    const fontSize = $('#font-size-select').val();
    let size;

    switch (fontSize) {
        case 'small':
            size = '12px';
            break;
        case 'normal':
            size = '16px';
            break;
        case 'big':
            size = '20px';
            break;
        case 'very-big':
            size = '24px';
            break;
        default:
            size = '16px';
    }

    $('body').css('font-size', size);
    $('#chat-list').css('font-size', size); // Change font size of chat list
    $('#chat-list .chat-item').css('font-size', size); // Change font size of chat list items
    $('#chat-list .chat-item .username').css('font-size', size); // Change font size of usernames in chat list
    $('#chat-list .new-group-button').css('font-size', size); // Change font size of "Crear nuevo grupo" button
    localStorage.setItem('fontSize', fontSize);
}

function aplicarTamanoFuenteGuardado() {
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    ajustarTamanoFuente(savedFontSize);
}

// Call this function on page load to apply the saved font size
document.addEventListener('DOMContentLoaded', () => {
    aplicarTamanoFuenteGuardado();
    mostrarChats(); // Mostrar todos los usuarios y grupos al inicio

    // Asociar la barra de búsqueda
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', handleSearch);
});

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
        const endpoint = type === 'group' ? "enviar_missatge_grup" : "enviar_missatge";
        const body = type === 'group' ? { id_grup: id, missatge: messageText } : { remitente: loggedInUser, destinatario: id.toString(), mensaje: messageText };

        const response = await fetch(`http://localhost:8000/${endpoint}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo enviar el mensaje.`);
        }

        const result = await response.json();
        console.log("✅ Mensaje enviado:", result);

        // Limpiar el input de mensaje
        messageInput.value = '';

        // Añadir el mensaje al chat
        const chatMessages = document.getElementById('chat-messages-new');
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.innerHTML = `
            <strong>${loggedInUser}</strong>: ${messageText} <br>
            <small>${new Date().toLocaleString()}</small>
        `;
        chatMessages.appendChild(messageElement);

        // Scroll to the bottom of the chat container
        chatMessages.scrollTop = chatMessages.scrollHeight;

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