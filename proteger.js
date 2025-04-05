document.addEventListener("DOMContentLoaded", function () {
    const usuarioLogueado = localStorage.getItem("usuarioLogueado");

    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para acceder a los videos.");
        window.location.href = "index.html"; // Redirige al login si no ha iniciado sesión
    }

    // 🔹 CERRAR SESIÓN
    const btnCerrarSesion = document.getElementById("cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", function () {
            localStorage.removeItem("usuarioLogueado"); // Eliminar sesión
            window.location.href = "index.html"; // Redirigir al login
        });
    }
});
