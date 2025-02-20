async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuari: username, pwd: password }),
        });

        const result = await response.json();
        console.log(result);

        if (response.ok && result.access_token) { // Cambia "message" por "access_token"
            alert("¡Login exitoso! Redirigiendo...");
            localStorage.setItem("jwt_token", result.access_token); // Guarda el token
            localStorage.setItem("loggedInUser", username); // Guarda el nombre de usuario
            window.location.href = "usuarios.html"; // Redirige a la página de usuarios
        } else {
            alert(result.message || "Usuario o contraseña incorrectos");
        }
    } catch (error) {
        console.error("Error al realizar la solicitud:", error);
        alert("Ocurrió un error inesperado.");
    }
}

// Vincular el formulario al manejador de login
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-Form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
});
document.body.style.zoom = "75%";