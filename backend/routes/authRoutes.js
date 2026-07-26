const express = require('express');

const router = express.Router();

const { login } = require('../controllers/authController');


// =====================================
// POST /api/auth/login
// Inicio de sesión
// =====================================

router.post('/login', login);


module.exports = router;