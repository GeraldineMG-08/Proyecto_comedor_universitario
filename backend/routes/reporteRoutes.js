const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const {
    getPeriodos,
    getKPIs,
    getChartCalorias,
    getChartRestricciones,
    getTablaMenus,
    getTablaRestricciones
} = require('../controllers/reporteController');

router.get('/periodos', verificarToken, getPeriodos);
router.get('/kpis', verificarToken, getKPIs);
router.get('/chart-calorias', verificarToken, getChartCalorias);
router.get('/chart-restricciones', verificarToken, getChartRestricciones);
router.get('/tabla-menus', verificarToken, getTablaMenus);
router.get('/tabla-restricciones', verificarToken, getTablaRestricciones);

module.exports = router;
