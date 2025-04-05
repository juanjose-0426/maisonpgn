async function login(usuario, contraseña) {
    try {
        const response = await fetch("http://localhost:5000/login", {  // ⬅️ Cambia la URL
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario, contraseña })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Login exitoso:", data);
        return data;
    } catch (error) {
        console.error("❌ Error en la solicitud:", error);
    }
}
