import mysql from 'mysql2/promise';

async function testDB() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Duglas26',
            database: 'tu_base_de_datos'
        });

        console.log("✅ Conexión exitosa a MySQL");
        await db.end();
    } catch (error) {
        console.error("❌ Error en la conexión a MySQL:", error.message);
    }
}

testDB();