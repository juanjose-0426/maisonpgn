document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem("token"); // 🗑️ Elimina el token del usuario
    window.location.href = "index.html"; // 🔄 Redirige al login
});
