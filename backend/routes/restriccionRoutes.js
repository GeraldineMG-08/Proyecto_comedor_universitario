const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verificarToken } = require('../middlewares/authMiddleware');
const {
    listarRestricciones,
    buscarEstudiante,
    guardarRestriccion,
    eliminarRestriccion,
    getTipos
} = require('../controllers/restriccionController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/restricciones');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, uniqueSuffix + '-' + cleanName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/listar', verificarToken, listarRestricciones);
router.get('/buscar-estudiante', verificarToken, buscarEstudiante);
router.post('/guardar', verificarToken, upload.single('archivo'), guardarRestriccion);
router.post('/eliminar', verificarToken, eliminarRestriccion);
router.get('/tipos', verificarToken, getTipos);

module.exports = router;
