const {
    handleErrorCargarChats,
    handleErrorCargarMensajes,
    handleErrorEnviarMensaje,
    handleErrorMarcarComoLeido,
    handleErrorObtenerUsuariosYGrupos
} = require('./controlerrores.js');

document.addEventListener('DOMContentLoaded', () => {
    aplicarFondoChat();
    mostrarChats();
    cargarBienvenida();

    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', handleSearch);

    setInterval(actualizarListaChats, 3000);
    setInterval(actualizarMensajesChatActual, 3000);
});

async function obtenerUsuariosYGrupos() {
    const token = localStorage.getItem("jwt_token");
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
        handleErrorObtenerUsuariosYGrupos(error);
    }
}

function actualizarListaChats() {
    mostrarChats();
}

function actualizarMensajesChatActual() {
    const chatHeader = document.getElementById('chat-header-new');
    if (chatHeader) {
        const type = chatHeader.getAttribute('data-type');
        const id = chatHeader.getAttribute('data-id');
        cargarMensajes();
    }
}

async function mostrarChats(filter = '') {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        console.error("No hay token almacenado.");
        return;
    }

    try {
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

        const items = await response.json();
        console.log("Lista de amigos y grupos:", items);

        if (!Array.isArray(items)) {
            console.error("Datos recibidos no son un array.");
            return;
        }

        const filteredItems = items.filter(item =>
            (item.username || item.nom).toLowerCase().includes(filter.toLowerCase())
        );

        const chatList = document.getElementById('chat-list');
        if (!chatList) {
            console.error("No se encontró el elemento 'chat-list'.");
            return;
        }

        chatList.innerHTML = '';

        const newGroupButton = document.createElement('li');
        newGroupButton.className = 'chat-item';

        const newGroupButtonElement = document.createElement('button');
        newGroupButtonElement.className = 'new-group-button';
        newGroupButtonElement.textContent = 'Crear nuevo grupo +';
        newGroupButtonElement.onclick = cargarCrearGrupo;

        newGroupButton.appendChild(newGroupButtonElement);
        chatList.appendChild(newGroupButton);

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
        handleErrorCargarChats(error);
    }
}

function handleSearch(event) {
    const filter = event.target.value;
    mostrarChats(filter);
}

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

    const markAsReadButton = document.createElement('button');
    markAsReadButton.textContent = 'Marcar como leído';
    markAsReadButton.className = 'mark-as-read-button';
    markAsReadButton.style.marginLeft = '10px';
    markAsReadButton.onclick = () => marcarChatComoLeido(type, id);
    chatHeader.appendChild(markAsReadButton);

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
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const verMiembrosButton = document.createElement('button');
        verMiembrosButton.textContent = 'Ver miembros';
        verMiembrosButton.className = 'group-button';
        verMiembrosButton.setAttribute('onclick', `verMiembrosGrupo(${id})`);
        buttonContainer.appendChild(verMiembrosButton);

        const añadirUsuarioButton = document.createElement('button');
        añadirUsuarioButton.textContent = 'Añadir usuarios';
        añadirUsuarioButton.className = 'group-button';
        añadirUsuarioButton.setAttribute('onclick', `añadirUsuarioAGrupo(${id})`);
        buttonContainer.appendChild(añadirUsuarioButton);

        const abandonarGrupoButton = document.createElement('button');
        abandonarGrupoButton.textContent = 'Abandonar grupo';
        abandonarGrupoButton.className = 'group-button';
        abandonarGrupoButton.onclick = () => confirmarAbandonarGrupo(id);
        buttonContainer.appendChild(abandonarGrupoButton);

        chatHeader.appendChild(buttonContainer);
    }

    welcome.appendChild(chatHeader);

    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages-new';
    chatMessages.style.overflowY = 'auto';
    chatMessages.style.height = '70vh';
    chatMessages.style.touchAction = 'pan-y';
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

    let offset = 0;
    const limit = 10;
    let loading = false;

    let lastMessageId = null;

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

        if (more) {
            // Cargar mensajes anteriores (scroll hacia arriba)
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

                chatMessages.prepend(messageElement); // Agregar al principio
            });

            offset += limit;
        } else {
            // Cargar mensajes nuevos (intervalo o carga inicial)
            const newMessages = lastMessageId
                ? messages.filter(msg => msg.id > lastMessageId)
                : messages;

            if (newMessages.length > 0) {
                console.log("🆕 Mensajes nuevos detectados:", newMessages);

                newMessages.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

                newMessages.forEach(msg => {
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

                    chatMessages.appendChild(messageElement); // Agregar al final
                });

                // Actualizar el último mensaje cargado
                lastMessageId = newMessages[newMessages.length - 1].id;
                console.log("🆔 Último mensaje cargado:", lastMessageId);

                // Ajustar el scroll solo si el usuario estaba en la parte inferior
                const isScrolledToBottom = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 1;
                if (isScrolledToBottom) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            } else {
                console.log("🔄 No hay mensajes nuevos.");
            }
        }
        } catch (error) {
            handleErrorCargarMensajes(error);
        } finally {
            loading = false;
        }
    }

    function actualizarMensajesChatActual() {
        console.log("⏰ Intervalo ejecutado: Actualizando mensajes...");
        const chatHeader = document.getElementById('chat-header-new');
        if (chatHeader) {
            cargarMensajes(); // Ensure cargarMensajes is defined in this scope
        }
    }
    
    // Define cargarMensajes before setting up the interval
    let intervalId = setInterval(actualizarMensajesChatActual, 3000);
    
    cargarMensajes();
    setupScroll(chatMessages, cargarMensajes);
    aplicarFondoChat();

    function setupScroll(chatMessages, cargarMensajes) {
        let lastScrollTop = chatMessages.scrollTop;
    
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

async function enviarMensaje(type, id, name) {
    const messageInput = document.getElementById('message-input-new');
    const messageText = messageInput.value.trim();

    if (!messageText) {
        console.warn("⚠️ No se puede enviar un mensaje vacío.");
        return;
    }

    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        console.error("No se encontró el usuario logueado.");
        return;
    }

    const token = localStorage.getItem("jwt_token");

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

        messageInput.value = '';

        const chatMessages = document.getElementById('chat-messages-new');
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        const strongElement = document.createElement('strong');
        strongElement.textContent = loggedInUser;
        messageElement.appendChild(strongElement);

        const messageTextNode = document.createTextNode(`: ${messageText} `);
        messageElement.appendChild(messageTextNode);

        const brElement = document.createElement('br');
        messageElement.appendChild(brElement);

        const smallElement = document.createElement('small');
        smallElement.textContent = new Date().toLocaleString();
        messageElement.appendChild(smallElement);
        chatMessages.appendChild(messageElement);

        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        handleErrorEnviarMensaje(error);
    }
}

async function marcarChatComoLeido(type, id) {
    const token = localStorage.getItem("jwt_token");
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!token || !loggedInUser) {
        console.error("No se encontró el token o el usuario logueado.");
        return;
    }

    try {
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
        const loggedInUserId = userData.id;

        const endpoint = type === 'group' 
            ? `marcar_mensajes_como_leidos_grup?id_grup=${id}` 
            : `marcar_mensajes_como_leidos`;

        const receptorId = parseInt(id, 10);

        console.log(`📢 Usuario logueado: ${loggedInUser} (ID: ${loggedInUserId})`);
        console.log(`📢 ID del receptor: ${receptorId}`);

        const body = type === 'group' 
            ? { id_grup: receptorId } 
            : { receptor: loggedInUserId, emisor: receptorId };

        console.log("📦 Enviando solicitud para marcar mensajes como leídos:", body);

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

        setTimeout(() => {
            cargarMensajes();
            actualizarVistaMensajes(receptorId);
        }, 500);

    } catch (error) {
        handleErrorMarcarComoLeido(error);
    }
}

function aplicarFondoChat() {
    const selectedImage = localStorage.getItem('selectedBackgroundImage');
    if (selectedImage) {
        cambiarFondoChat(selectedImage);
    }
}

function cargarBienvenida() {
    const welcome = document.getElementById('welcome-container');
    welcome.innerHTML = '';

    const logoImg = document.createElement('img');
    logoImg.src = 'whatsapp-logo.webp';
    logoImg.alt = 'WhatsApp Logo';
    logoImg.className = 'logo small-logo';
    welcome.appendChild(logoImg);

    const welcomeHeading = document.createElement('h1');
    welcomeHeading.textContent = '¡Bienvenidos a Wahapp!';
    welcome.appendChild(welcomeHeading);

    const welcomeParagraph = document.createElement('p');
    welcomeParagraph.textContent = 'Selecciona un chat para comenzar a conversar.';
    welcome.appendChild(welcomeParagraph);
}
