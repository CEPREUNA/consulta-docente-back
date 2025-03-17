const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Para restringir el acceso con CORS

// Middleware para permitir solicitudes JSON
app.use(express.json());
app.use(express.static('public'));

// Configura CORS para restringir el acceso al frontend
const corsOptions = {
    origin: 'http://localhost:3000', // Cambia esto por tu dominio en GitHub Pages o Railway
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Almacenar el CAPTCHA generado (en memoria, para simplificar)
let captchaServer = null;

// Endpoint para generar un CAPTCHA
app.get('/api/generar-captcha', (req, res) => {
    captchaServer = Math.floor(Math.random() * 9000) + 1000; // Número aleatorio de 4 dígitos
    res.json({ captcha: captchaServer });
});

// Endpoint para consultar el estado
app.post('/api/consultar', (req, res) => {
    const { dni, captchaInput } = req.body;

    // Validar CAPTCHA
    if (captchaInput != captchaServer) {
        return res.status(400).json({ error: 'CAPTCHA incorrecto' });
    }

    // Cargar datos desde el archivo JSON
    const datos = JSON.parse(fs.readFileSync(path.join(__dirname, 'datos.json'), 'utf8'));
    const usuario = datos.find(user => user.nro_documento === dni);

    if (usuario) {
        res.json({
            nombre: usuario.Nombres_y_Apellidos,
            estado: usuario.Estado,
        });
    } else {
        res.status(404).json({ error: 'DNI no encontrado' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});