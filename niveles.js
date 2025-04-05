document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });

    const res = await fetch("/niveles", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    const container = document.getElementById("niveles-container");
    container.innerHTML = "";

    data.niveles.forEach(nivel => {
        container.innerHTML += `
            <div>
                <h2>Nivel ${nivel}</h2>
                <video controls>
                    <source src="/videos/nivel${nivel}.mp4" type="video/mp4">
                    Tu navegador no soporta videos.
                </video>
            </div>
        `;
    });
});
