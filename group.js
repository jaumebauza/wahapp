const {
    handleErrorAñadirUsuarioAGrupo,
    handleErrorVerMiembrosGrupo,
    handleErrorAbandonarGrupo,
    handleErrorCrearGrupo
} = require('./controlerrores.js');

async function añadirUsuarioAGrupo(grup_id) {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        console.error("No hay token almacenado.");
        return;
    }

    const existingContainer = document.getElementById('añadir-usuario-container');
    if (existingContainer) {
        existingContainer.remove();
        añadirUsuarioMenuAbierto = false;
        return;
    }

    try {
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

        const container = document.createElement('div');
        container.id = 'añadir-usuario-container';
        container.style.marginTop = '10px';

        const select = document.createElement('select');
        select.id = 'usuarios-disponibles';

        usuarisDisponibles.forEach(usuari => {
            const option = document.createElement('option');
            option.value = usuari.id;
            option.textContent = usuari.username;
            select.appendChild(option);
        });

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
                window.location.reload();
            } catch (error) {
                handleErrorAñadirUsuarioAGrupo(error);
            }
        };

        container.appendChild(select);
        container.appendChild(confirmButton);

        const añadirUsuarioButton = document.querySelector(`button[onclick="añadirUsuarioAGrupo(${grup_id})"]`);
        if (!añadirUsuarioButton) {
            console.error("No se encontró el botón 'Añadir usuarios'.");
            return;
        }
        añadirUsuarioButton.insertAdjacentElement('afterend', container);

        añadirUsuarioMenuAbierto = true;
    } catch (error) {
        handleErrorAñadirUsuarioAGrupo(error);
    }
}

async function verMiembrosGrupo(grup_id) {
    try {
        const token = localStorage.getItem("jwt_token");
        if (!token) {
            console.error("No hay token almacenado.");
            return;
        }

        const existingContainer = document.getElementById('members-container');
        if (existingContainer) {
            existingContainer.remove();
            verMiembrosMenuAbierto = false;
            return;
        }

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

        const loggedInUser = localStorage.getItem("loggedInUser");

        const membersContainer = document.createElement('div');
        membersContainer.id = 'members-container';

        membersContainer.style.position = 'fixed';
        membersContainer.style.backgroundColor = '#fff';
        membersContainer.style.border = '1px solid #ccc';
        membersContainer.style.padding = '10px';
        membersContainer.style.zIndex = '1000';
        membersContainer.style.maxHeight = '300px';
        membersContainer.style.overflowY = 'auto';

        if (window.innerWidth <= 768) {
            membersContainer.style.top = '210px';
            membersContainer.style.left = '75%';
            membersContainer.style.transform = 'translateX(-50%)';
        } else {
            membersContainer.style.top = '120px';
            membersContainer.style.left = '87%';
            membersContainer.style.transform = 'translateX(-50%)';
        }

        membres.forEach(membre => {
            console.log("Miembro:", membre);
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';

            const memberName = document.createElement('strong');
            memberName.textContent = `${membre.username} ${membre.es_admin ? '(Admin)' : ''}`;
            memberItem.appendChild(memberName);

            if (!membre.es_admin) {
                const makeAdminButton = document.createElement('button');
                makeAdminButton.textContent = 'Hacer admin';
                makeAdminButton.className = 'make-admin-button';

                makeAdminButton.onclick = async () => {
                    if (!membre.id || membre.id === 0) {
                        console.error("Error: No se encontró el ID del usuario.");
                        return;
                    }

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
                    window.location.reload();
                };

                memberItem.appendChild(makeAdminButton);
            }

            if (membre.es_admin && membre.username !== loggedInUser) {
                const removeAdminButton = document.createElement('button');
                removeAdminButton.textContent = 'Quitar admin';
                removeAdminButton.className = 'remove-admin-button';

                removeAdminButton.onclick = async () => {
                    if (!membre.id || membre.id === 0) {
                        console.error("Error: No se encontró el ID del usuario.");
                        return;
                    }

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
                    window.location.reload();
                };

                memberItem.appendChild(removeAdminButton);
            }

            if (membre.username !== loggedInUser) {
                const deleteUserButton = document.createElement('button');
                deleteUserButton.textContent = 'Eliminar usuario';
                deleteUserButton.className = 'delete-user-button';

                deleteUserButton.onclick = async () => {
                    if (!membre.id || membre.id === 0) {
                        console.error("Error: No se encontró el ID del usuario.");
                        return;
                    }

                    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar a ${membre.username} del grupo?`);
                    if (!confirmacion) return;

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
                    window.location.reload();
                };

                memberItem.appendChild(deleteUserButton);
            }

            membersContainer.appendChild(memberItem);
        });

        document.body.appendChild(membersContainer);

        verMiembrosMenuAbierto = true;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && verMiembrosMenuAbierto) {
                const existingContainer = document.getElementById('members-container');
                if (existingContainer) {
                    existingContainer.remove();
                    verMiembrosMenuAbierto = false;
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        const closeMenu = () => {
            const existingContainer = document.getElementById('members-container');
            if (existingContainer) {
                existingContainer.remove();
                verMiembrosMenuAbierto = false;
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
        };

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cerrar';
        closeButton.className = 'close-button';
        closeButton.onclick = closeMenu;
        membersContainer.appendChild(closeButton);

    } catch (error) {
        handleErrorVerMiembrosGrupo(error);
    }
}

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
        window.location.reload();
    } catch (error) {
        handleErrorAbandonarGrupo(error);
    }
}

function cargarCrearGrupo() {
    const welcome = document.getElementById('welcome-container');
    const chatContainer = document.querySelector('.chat-container');

    if (window.innerWidth <= 768) {
        chatContainer.classList.add('hide-on-mobile');
        welcome.classList.add('show-on-mobile');
    }

    welcome.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'header';

    const backButton = document.createElement('button');
    backButton.textContent = 'Volver';
    backButton.className = 'back-button';
    backButton.onclick = () => {
        welcome.innerHTML = '';
        welcome.classList.remove('show-on-mobile');
        chatContainer.classList.remove('hide-on-mobile');
        if (window.innerWidth > 768) {
            cargarBienvenida();
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
    nombreInput.required = true;
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

async function crearGrupo() {
    const nombre = document.getElementById('nombre-grupo').value.trim();
    const descripcion = document.getElementById('descripcion-grupo').value.trim();

    if (!nombre) {
        alert("El nombre del grupo es obligatorio.");
        return;
    }

    const token = localStorage.getItem("jwt_token");

    if (!token) {
        alert("No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.");
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/crear_grup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nom: nombre, descripcio: descripcion })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Grupo creado:', result);
        mostrarChats();
        cargarBienvenida();
    } catch (error) {
        handleErrorCrearGrupo(error);
    }
}
