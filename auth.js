document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwt_token");

    console.log("🔍 Token al cargar usuarios.html:", token);

    if (!token || token === "null") {
        console.warn("⚠️ No hay token, redirigiendo a login...");
        window.location.href = "login.html";
    } else {
        console.log("✅ Token válido, cargando usuarios...");
        showLoggedInUser();
        obtenerUsuariosYGrupos();
    }
});



function cerrarSesion() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}
