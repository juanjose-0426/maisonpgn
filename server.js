import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// ✅ Configuración de MySQL con reintento automático
const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "Duglas26",
    database: "plataforma_videos",
    port: 3306
};

let db;
const connectDB = async () => {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log("✅ Conectado a MySQL correctamente.");
    } catch (error) {
        console.error("❌ Error al conectar a MySQL:", error.message);
        setTimeout(connectDB, 5000); // Reintenta en 5 segundos si falla
    }
};
connectDB();

// ✅ Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));
app.use("/videos", express.static(path.join(__dirname, "uploads")));

// ✅ Crear directorio `uploads` si no existe
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("📁 Directorio 'uploads' creado.");
}

// ✅ Configuración de Multer para subir videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/avi", "video/mkv"];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("❌ Tipo de archivo no permitido"), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1000 * 1024 * 1024 }
});

// ✅ Middleware para verificar token
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ error: "Token requerido" });

    jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido" });
        req.userId = decoded.id;
        next();
    });
};

// ✅ Ruta principal
app.get("/", (req, res) => res.send("Servidor corriendo correctamente"));

// ✅ Login de usuario
app.post("/login", async (req, res) => {
    try {
        const { usuario, contraseña } = req.body;
        console.log("📥 Datos recibidos:", req.body);

        if (!usuario || !contraseña) return res.status(400).json({ error: "Faltan datos" });

        const [users] = await db.execute("SELECT * FROM usuarios WHERE usuario = ?", [usuario]);
        if (users.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

        const user = users[0];
        const match = await bcrypt.compare(contraseña, user.contraseña);
        if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret_key", { expiresIn: "1h" });

        res.json({ mensaje: "Inicio de sesión exitoso", token });
    } catch (error) {
        console.error("❌ Error en el login:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// ✅ Obtener videos desbloqueados
app.get("/progreso", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const [result] = await db.execute("SELECT IFNULL(FLOOR(TIMESTAMPDIFF(DAY, fecha_inicio, NOW()) / 2) + 1, 1) AS nivel_actual FROM usuarios WHERE id = ?", [userId]);

        if (result.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        res.json(result[0]);
    } catch (error) {
        console.error("❌ Error obteniendo el progreso:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});


// ✅ Subir un video
app.post("/subir-video", verifyToken, upload.single("video"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No se subió ningún archivo" });

        let { titulo, nivel } = req.body;
        nivel = parseInt(nivel, 10);

        if (!titulo || isNaN(nivel) || nivel < 1 || nivel > 6) {
            return res.status(400).json({ error: "Datos de video inválidos" });
        }

        const videoPath = req.file.filename;
        await db.execute("INSERT INTO videos (titulo, nivel, ruta_video) VALUES (?, ?, ?)", [titulo, nivel, videoPath]);

        res.json({ mensaje: "Video subido con éxito", ruta: videoPath });
    } catch (error) {
        console.error("❌ Error al subir el video:", error);
        res.status(500).json({ error: "Error al subir el video" });
    }
});

// 🔴 Ruta no encontrada (404)
app.use((req, res) => res.status(404).send("Ruta no encontrada"));

app.listen(port, () => console.log(`🚀 Servidor corriendo en http://localhost:${port}`));