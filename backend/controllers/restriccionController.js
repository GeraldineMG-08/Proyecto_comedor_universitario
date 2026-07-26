const RestriccionModel = require('../models/restriccionModel');
const path = require('path');
const fs = require('fs');

const listarRestricciones = async (req, res) => {
    try {
        const data = await RestriccionModel.listarRestricciones();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in listarRestricciones:', error);
        return res.status(500).json({ error: 'Error del servidor al listar restricciones.' });
    }
};

const buscarEstudiante = async (req, res) => {
    try {
        const { q } = req.query;
        const data = await RestriccionModel.buscarEstudiantes(q || '');
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in buscarEstudiante:', error);
        return res.status(500).json({ error: 'Error del servidor al buscar estudiantes.' });
    }
};

const guardarRestriccion = async (req, res) => {
    try {
        const id = req.body.id ? parseInt(req.body.id) : null;
        const id_becario = parseInt(req.body.id_becario);
        const id_tipo_restriccion = parseInt(req.body.id_tipo_restriccion);
        const alimentos_restringidos = req.body.alimentos_restringidos;
        const fecha_inicio = req.body.fecha_inicio;
        const fecha_termino = req.body.fecha_termino;
        const userId = req.usuario ? req.usuario.id : 2;

        let ruta_sustento = null;
        if (req.file) {
            ruta_sustento = req.file.filename;
        }

        if (!id && !id_becario) {
            return res.status(400).json({ error: 'Falta especificar el becario.' });
        }

        if (!alimentos_restringidos || !fecha_inicio || !fecha_termino) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        const savedId = await RestriccionModel.guardarRestriccion(
            id,
            id_becario,
            id_tipo_restriccion,
            alimentos_restringidos,
            fecha_inicio,
            fecha_termino,
            ruta_sustento,
            userId
        );

        return res.status(200).json({ success: true, id: savedId });
    } catch (error) {
        console.error('Error in guardarRestriccion:', error);
        return res.status(500).json({ error: 'Error del servidor al guardar la restricción.' });
    }
};

const eliminarRestriccion = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Falta especificar el ID.' });
        }
        await RestriccionModel.eliminarRestriccion(id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error in eliminarRestriccion:', error);
        return res.status(500).json({ error: 'Error del servidor al desactivar la restricción.' });
    }
};

const getTipos = async (req, res) => {
    try {
        const data = await RestriccionModel.getTiposRestricciones();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in getTipos:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener tipos.' });
    }
};

module.exports = {
    listarRestricciones,
    buscarEstudiante,
    guardarRestriccion,
    eliminarRestriccion,
    getTipos
};
