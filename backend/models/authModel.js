const pool = require('../config/db');

/**
 * Buscar usuario por código
 */
const obtenerUsuarioPorCodigo = async (codigoUsuario) => {

    const query = `
        SELECT

            u.id,
            u.codigo_usuario,
            u.password_hash,
            u.email_personal,
            u.celular_actual,
            u.rol,
            u.estado_cuenta,
            u.ultimo_acceso,
            u.intentos_fallidos,
            u.bloqueado_hasta,

            /* Personal administrativo */

            pa.nombres AS admin_nombres,
            pa.apellidos AS admin_apellidos,
            pa.cargo,
            pa.area,

            /* Becario */

            b.codigo_becario,
            b.estado AS estado_becario,
            b.tiene_desayuno,
            b.tiene_almuerzo,

            /* Estudiante */

            pe.nombres AS est_nombres,
            pe.apellido_paterno,
            pe.apellido_materno

        FROM usuarios u

        LEFT JOIN personal_administrativo pa
            ON pa.id_usuario = u.id

        LEFT JOIN becarios b
            ON b.id_usuario = u.id

        LEFT JOIN padron_estudiantes pe
            ON pe.id = b.id_estudiante

        WHERE u.codigo_usuario = $1

        LIMIT 1;
    `;

    const { rows } = await pool.query(query, [codigoUsuario]);

    if (rows.length === 0) {
        return null;
    }

    const usuario = rows[0];

    /**
     * Construir nombre completo
     */

    if (usuario.rol === 'becario') {

        usuario.nombre_completo = [

            usuario.est_nombres,
            usuario.apellido_paterno,
            usuario.apellido_materno

        ]
        .filter(Boolean)
        .join(' ');

    } else {

        usuario.nombre_completo = [

            usuario.admin_nombres,
            usuario.admin_apellidos

        ]
        .filter(Boolean)
        .join(' ');

    }

    return usuario;

};

/**
 * Login exitoso
 */
const registrarLoginExitoso = async (idUsuario) => {

    const query = `
        UPDATE usuarios
        SET
            ultimo_acceso = NOW(),
            intentos_fallidos = 0,
            bloqueado_hasta = NULL,
            updated_at = NOW()
        WHERE id = $1;
    `;

    await pool.query(query, [idUsuario]);

};

/**
 * Registrar intento fallido
 */
const registrarIntentoFallido = async (idUsuario) => {

    const query = `
        UPDATE usuarios
        SET
            intentos_fallidos = intentos_fallidos + 1,
            updated_at = NOW()
        WHERE id = $1;
    `;

    await pool.query(query, [idUsuario]);

};

/**
 * Obtener intentos
 */
const obtenerIntentos = async (idUsuario) => {

    const query = `
        SELECT intentos_fallidos
        FROM usuarios
        WHERE id = $1;
    `;

    const { rows } = await pool.query(query, [idUsuario]);

    return rows.length ? rows[0].intentos_fallidos : 0;

};

/**
 * Bloquear cuenta
 */
const bloquearCuenta = async (idUsuario, minutos = 15) => {

    const query = `
        UPDATE usuarios
        SET
            bloqueado_hasta = NOW() + ($2 * INTERVAL '1 minute'),
            updated_at = NOW()
        WHERE id = $1;
    `;

    await pool.query(query, [idUsuario, minutos]);

};

/**
 * Reiniciar intentos manualmente
 */
const reiniciarIntentos = async (idUsuario) => {

    const query = `
        UPDATE usuarios
        SET
            intentos_fallidos = 0,
            bloqueado_hasta = NULL,
            updated_at = NOW()
        WHERE id = $1;
    `;

    await pool.query(query, [idUsuario]);

};

/**
 * Cambiar estado de cuenta
 */
const actualizarEstadoCuenta = async (idUsuario, estado) => {

    const query = `
        UPDATE usuarios
        SET
            estado_cuenta = $2,
            updated_at = NOW()
        WHERE id = $1;
    `;

    await pool.query(query, [idUsuario, estado]);

};

module.exports = {

    obtenerUsuarioPorCodigo,

    registrarLoginExitoso,

    registrarIntentoFallido,

    obtenerIntentos,

    bloquearCuenta,

    reiniciarIntentos,

    actualizarEstadoCuenta

};