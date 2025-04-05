document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "index.html"; // 🔄 Redirige si no hay sesión activa
        return;
    }

    await solicitarPermisoNotificaciones();
    await cargarVideos();

    // Evento de cierre de sesión
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", cerrarSesion);
    }
});

// 🔹 Pedir permiso para notificaciones
async function solicitarPermisoNotificaciones() {
    if (Notification.permission === "granted") return;

    try {
        const permiso = await Notification.requestPermission();
        console.log(permiso === "granted" ? "✅ Notificaciones activadas." : "⚠️ Notificaciones bloqueadas.");
    } catch (error) {
        console.warn("⚠️ Error al solicitar permisos:", error);
    }
}

// 🔹 Carga de videos autenticados
async function cargarVideos() {
    try {
        const respuesta = await fetch("/progreso", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!respuesta.ok) throw new Error("No se pudo obtener el progreso");

        const progreso = await respuesta.json();
        mostrarVideos(progreso.nivel_actual);
    } catch (error) {
        console.error("❌ Error cargando videos:", error);
    }
}

// 🔹 Mostrar videos según progreso del usuario
function mostrarVideos(nivelActual) {
    const videos = document.querySelectorAll(".video");
    videos.forEach(video => {
        const nivel = parseInt(video.dataset.nivel, 10);
        if (nivel <= nivelActual) {
            video.classList.remove("bloqueado");
            video.querySelector("video").setAttribute("controls", "controls");
        }
    });
}

// 🔹 Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

// 🔹 Validación de login
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();

        if (!usuario || !contrasena) {
            mostrarMensaje("Todos los campos son obligatorios.", "error");
            return;
        }

        try {
            const respuesta = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, contrasena }),
            });

            const resultado = await respuesta.json();

            if (resultado.exito) {
                localStorage.setItem("token", resultado.token);
                window.location.href = "videos.html";
            } else {
                mostrarMensaje("Usuario o contraseña incorrectos.", "error");
            }
        } catch (error) {
            mostrarMensaje("Error de conexión, intenta de nuevo.", "error");
        }
    });
}

// 🔹 Validación de registro
const registroForm = document.getElementById("registro-form");
if (registroForm) {
    registroForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const email = document.getElementById("email").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();

        if (!usuario || !email || !contrasena) {
            mostrarMensaje("Todos los campos son obligatorios.", "error");
            return;
        }

        try {
            const respuesta = await fetch("/api/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, email, contrasena }),
            });

            const resultado = await respuesta.json();

            if (resultado.success) {
                mostrarMensaje("Registro exitoso. Inicia sesión.", "success");
                setTimeout(() => (window.location.href = "index.html"), 1500);
            } else {
                mostrarMensaje(resultado.message || "Error en el registro.", "error");
            }
        } catch (error) {
            mostrarMensaje("Error de conexión, intenta de nuevo.", "error");
        }
    });
}

// 🔹 Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo = "info") {
    const mensajeDiv = document.createElement("div");
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `mensaje ${tipo}`;
    document.body.appendChild(mensajeDiv);

    setTimeout(() => mensajeDiv.remove(), 3000);
}
