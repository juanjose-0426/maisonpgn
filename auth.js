document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registroForm = document.getElementById("registro-form");
    const mostrarRegistro = document.getElementById("mostrar-registro");

    mostrarRegistro.addEventListener("click", () => {
        toggleForms();
    });

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleFormSubmit("/login", "usuario", "contrasena", "niveles.html");
    });

    registroForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleFormSubmit("/registro", "registro-usuario", "registro-contrasena", null, "Registro exitoso, ahora inicia sesión.");
    });

    function toggleForms() {
        loginForm.style.display = "none";
        registroForm.style.display = "block";
    }

    async function handleFormSubmit(url, userId, passwordId, redirectUrl, successMessage) {
        const usuario = document.getElementById(userId).value;
        const contrasena = document.getElementById(passwordId).value;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, contrasena }),
            });

            const data = await res.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                }
            } else if (data.mensaje) {
                alert(successMessage);
                window.location.reload();
            } else {
                alert("Usuario o contraseña incorrectos");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Ocurrió un error, por favor intenta de nuevo.");
        }
    }
});
