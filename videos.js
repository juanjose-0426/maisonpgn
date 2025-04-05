const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/db");

const router = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"), // Carpeta donde se guardan los videos
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage, limits: { fileSize: 1000 * 1024 * 1024 } }); // Límite 1000MB

// 📌 Endpoint para subir un video
router.post("/subir", upload.single("video"), async (req, res) => {
    const { titulo, nivel } = req.body;
    if (!req.file) return res.status(400).json({ message: "No se subió ningún archivo" });

    try {
        const archivo = req.file.filename;
        await db.query("INSERT INTO videos (titulo, archivo, nivel) VALUES (?, ?, ?)", [titulo, archivo, nivel]);
        res.json({ message: "Video subido con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al subir el video" });
    }
});

// 📌 Endpoint para obtener la lista de videos
router.get("/", async (req, res) => {
    try {
        const [videos] = await db.query("SELECT * FROM videos ORDER BY nivel ASC");
        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los videos" });
    }
});

module.exports = router;
