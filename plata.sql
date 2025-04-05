CREATE DATABASE plataforma_videos;

USE plataforma_videos;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    nivel_actual INT DEFAULT 1,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255),
    nivel INT,
    archivo VARCHAR(255)
);
