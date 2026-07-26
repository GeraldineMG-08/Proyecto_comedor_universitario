const MenuModel = require('../models/menuModel');

const getCalendarStatus = async (req, res) => {
    try {
        const { month } = req.query; // Expects 'YYYY-MM'
        if (!month) {
            return res.status(400).json({ ok: false, mensaje: 'Falta especificar el mes.' });
        }
        const data = await MenuModel.getCalendarStatus(month);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error in getCalendarStatus:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener estado de calendario.' });
    }
};

const getMenuDetail = async (req, res) => {
    try {
        const { date } = req.query; // Expects 'YYYY-MM-DD'
        if (!date) {
            return res.status(400).json({ ok: false, mensaje: 'Falta especificar la fecha.' });
        }

        const menu = await MenuModel.getMenuByDate(date);
        if (!menu) {
            return res.status(200).json({ success: true, data: null });
        }

        const details = await MenuModel.getMenuDetails(menu.id);

        // Convert the flat details list into structured object:
        // { desayuno: { 1: { plato: '...', kcal: 100 } }, ... }
        const structured = {
            id: menu.id,
            fecha: menu.fecha,
            estado: menu.estado,
            total_kcal: menu.total_kcal,
            desayuno: {},
            almuerzo: {},
            cena: {}
        };

        const serviceMapping = {
            1: 'desayuno',
            2: 'almuerzo',
            3: 'cena'
        };

        details.forEach(item => {
            const serviceName = serviceMapping[item.id_tipo_servicio];
            if (serviceName) {
                structured[serviceName][item.id_tipo_componente] = {
                    plato: item.nombre_plato,
                    kcal: item.calorias_kcal
                };
            }
        });

        return res.status(200).json({ success: true, data: structured });
    } catch (error) {
        console.error('Error in getMenuDetail:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener detalles del menú.' });
    }
};

const saveMenu = async (req, res) => {
    try {
        const { fecha, estado, total_kcal, data } = req.body;
        const userId = req.usuario ? req.usuario.id : 2; // Default to user 2 (Carlos Quispe - Nutricionista)

        if (!fecha || !estado || !data) {
            return res.status(400).json({ ok: false, mensaje: 'Datos obligatorios faltantes.' });
        }

        const menuId = await MenuModel.saveMenu(fecha, estado, total_kcal, userId, data);
        return res.status(200).json({ success: true, menuId });
    } catch (error) {
        console.error('Error in saveMenu:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error al guardar el menú.' });
    }
};

const deleteMenu = async (req, res) => {
    try {
        const { fecha } = req.body;
        if (!fecha) {
            return res.status(400).json({ ok: false, mensaje: 'Falta especificar la fecha.' });
        }
        await MenuModel.deleteMenu(fecha);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error in deleteMenu:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error al eliminar el menú.' });
    }
};

module.exports = {
    getCalendarStatus,
    getMenuDetail,
    saveMenu,
    deleteMenu
};
