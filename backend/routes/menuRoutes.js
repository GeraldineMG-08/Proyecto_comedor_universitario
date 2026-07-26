const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const {
    getCalendarStatus,
    getMenuDetail,
    saveMenu,
    deleteMenu
} = require('../controllers/menuController');

router.get('/calendar-status', verificarToken, getCalendarStatus);
router.get('/detail', verificarToken, getMenuDetail);
router.post('/save', verificarToken, saveMenu);
router.post('/delete', verificarToken, deleteMenu);

module.exports = router;
