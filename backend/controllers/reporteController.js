const ReporteModel = require('../models/reporteModel');

const getPeriodos = async (req, res) => {
    try {
        const data = await ReporteModel.getPeriodosDisponibles();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in getPeriodos:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener periodos.' });
    }
};

const getKPIs = async (req, res) => {
    try {
        const { periodo } = req.query; // 'YYYY-MM'
        if (!periodo) {
            return res.status(400).json({ error: 'Falta especificar el periodo.' });
        }
        const data = await ReporteModel.getKPIs(periodo);
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in getKPIs:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener KPIs.' });
    }
};

const getChartCalorias = async (req, res) => {
    try {
        const { periodo } = req.query;
        if (!periodo) {
            return res.status(400).json({ error: 'Falta especificar el periodo.' });
        }
        const data = await ReporteModel.getChartCalorias(periodo);
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in getChartCalorias:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener gráfico de calorías.' });
    }
};

const getChartRestricciones = async (req, res) => {
    try {
        const data = await ReporteModel.getChartRestricciones();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in getChartRestricciones:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener gráfico de restricciones.' });
    }
};

const getTablaMenus = async (req, res) => {
    try {
        const { periodo } = req.query;
        if (!periodo) {
            return res.status(400).json({ error: 'Falta especificar el periodo.' });
        }
        const data = await ReporteModel.getTablaMenus(periodo);
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in getTablaMenus:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener tabla de menús.' });
    }
};

const getTablaRestricciones = async (req, res) => {
    try {
        const data = await ReporteModel.getTablaRestricciones();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in getTablaRestricciones:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener tabla de restricciones.' });
    }
};

module.exports = {
    getPeriodos,
    getKPIs,
    getChartCalorias,
    getChartRestricciones,
    getTablaMenus,
    getTablaRestricciones
};
