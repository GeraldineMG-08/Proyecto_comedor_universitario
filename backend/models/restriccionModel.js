const pool = require('../config/db');

class RestriccionModel {
    static async listarRestricciones() {
        const query = `
            SELECT
                r.id,
                r.id_becario,
                r.id_tipo_restriccion,
                r.alimentos_restringidos,
                r.fecha_inicio::text as fecha_inicio,
                r.fecha_termino::text as fecha_termino,
                r.ruta_sustento,
                r.estado,
                CONCAT(pe.nombres, ' ', pe.apellido_paterno, ' ', pe.apellido_materno) as nombre_completo,
                pe.codigo_universitario,
                ep.nombre_escuela,
                tr.nombre as nombre_tipo
            FROM restricciones_alimentarias r
            INNER JOIN becarios b ON r.id_becario = b.id
            INNER JOIN usuarios u ON b.id_usuario = u.id
            INNER JOIN padron_estudiantes pe ON u.codigo_usuario = pe.codigo_universitario
            INNER JOIN escuelas_profesionales ep ON pe.id_escuela = ep.id
            LEFT JOIN tipos_restricciones tr ON r.id_tipo_restriccion = tr.id
            WHERE r.estado = 'activo'
            ORDER BY r.fecha_registro DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async buscarEstudiantes(q = '') {
        let query = `
            SELECT
                b.id as id_becario,
                pe.codigo_universitario as codigo,
                CONCAT(pe.nombres, ' ', pe.apellido_paterno, ' ', pe.apellido_materno) as nombre,
                pe.dni,
                ep.nombre_escuela as escuela
            FROM becarios b
            INNER JOIN usuarios u ON b.id_usuario = u.id
            INNER JOIN padron_estudiantes pe ON u.codigo_usuario = pe.codigo_universitario
            INNER JOIN escuelas_profesionales ep ON pe.id_escuela = ep.id
            WHERE b.estado = 'activo'
        `;
        const params = [];

        if (q && q.trim() !== '') {
            query += `
                AND (pe.codigo_universitario ILIKE $1
                OR CONCAT(pe.nombres, ' ', pe.apellido_paterno, ' ', pe.apellido_materno) ILIKE $1
                OR ep.nombre_escuela ILIKE $1)
            `;
            params.push(`%${q.trim()}%`);
        }

        query += ` ORDER BY pe.apellido_paterno ASC LIMIT 100`;
        const { rows } = await pool.query(query, params);
        return rows;
    }

    static async guardarRestriccion(id, idBecario, idTipoRestriccion, alimentos, inicio, termino, rutaSustento, userId) {
        if (id) {
            // Update
            let query = `
                UPDATE restricciones_alimentarias
                SET id_tipo_restriccion = $1,
                    alimentos_restringidos = $2,
                    fecha_inicio = $3,
                    fecha_termino = $4
            `;
            const params = [idTipoRestriccion, alimentos, inicio, termino];

            if (rutaSustento) {
                params.push(rutaSustento);
                query += `, ruta_sustento = $${params.length}`;
            }

            params.push(id);
            query += ` WHERE id = $${params.length}`;

            await pool.query(query, params);
            return id;
        } else {
            // Create
            const query = `
                INSERT INTO restricciones_alimentarias
                (id_becario, id_tipo_restriccion, alimentos_restringidos, fecha_inicio, fecha_termino, estado, ruta_sustento, id_usuario_registra, fecha_registro)
                VALUES ($1, $2, $3, $4, $5, 'activo', $6, $7, CURRENT_TIMESTAMP)
                RETURNING id
            `;
            const { rows } = await pool.query(query, [
                idBecario,
                idTipoRestriccion,
                alimentos,
                inicio,
                termino,
                rutaSustento,
                userId
            ]);
            return rows[0].id;
        }
    }

    static async eliminarRestriccion(id) {
        const query = `UPDATE restricciones_alimentarias SET estado = 'inactivo' WHERE id = $1`;
        await pool.query(query, [id]);
        return true;
    }

    static async getTiposRestricciones() {
        const query = `SELECT id, nombre FROM tipos_restricciones ORDER BY id ASC`;
        const { rows } = await pool.query(query);
        return rows;
    }
}

module.exports = RestriccionModel;
