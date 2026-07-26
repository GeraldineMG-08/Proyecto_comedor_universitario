const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AuthModel = require('../models/authModel');

const login = async (req, res) => {

    try {

        const { codigo_usuario, password } = req.body;

        // ==========================
        // Validar datos
        // ==========================

        if (!codigo_usuario || !password) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Debe ingresar el código de usuario y la contraseña.'
            });

        }

        const codigo = codigo_usuario.trim();

        // ==========================
        // Buscar usuario
        // ==========================

        const usuario = await AuthModel.obtenerUsuarioPorCodigo(codigo);

        if (!usuario) {

            return res.status(401).json({
                ok: false,
                mensaje: 'Usuario o contraseña incorrectos.'
            });

        }

        // ==========================
        // Estado de la cuenta
        // ==========================

        if (usuario.estado_cuenta !== 'activo') {

            return res.status(403).json({
                ok: false,
                mensaje: 'La cuenta se encuentra inactiva. Comuníquese con la asistenta social.'
            });

        }

        // ==========================
        // Validar estado del becario
        // ==========================

        if (
            usuario.rol === 'becario' &&
            usuario.estado_becario &&
            usuario.estado_becario !== 'activo'
        ) {

            return res.status(403).json({
                ok: false,
                mensaje: 'El becario no se encuentra activo.'
            });

        }

        // ==========================
        // Verificar bloqueo
        // ==========================

        if (
            usuario.bloqueado_hasta &&
            new Date(usuario.bloqueado_hasta) > new Date()
        ) {

            return res.status(403).json({
                ok: false,
                mensaje: 'La cuenta está bloqueada temporalmente. Intente nuevamente más tarde.'
            });

        }

        // ==========================
        // Verificar contraseña
        // ==========================

        const passwordValido = await bcrypt.compare(
            password,
            usuario.password_hash
        );

        if (!passwordValido) {

            await AuthModel.registrarIntentoFallido(usuario.id);

            const intentos = await AuthModel.obtenerIntentos(usuario.id);

            if (intentos >= 5) {

                await AuthModel.bloquearCuenta(usuario.id);

                return res.status(403).json({
                    ok: false,
                    mensaje: 'La cuenta ha sido bloqueada durante 15 minutos por exceder el número máximo de intentos.'
                });

            }

            return res.status(401).json({
                ok: false,
                mensaje: `Usuario o contraseña incorrectos. Intento ${intentos} de 5.`
            });

        }

        // ==========================
        // Login correcto
        // ==========================

        await AuthModel.registrarLoginExitoso(usuario.id);

        // ==========================
        // JWT
        // ==========================

        const token = jwt.sign(
            {
                id: usuario.id,
                codigo_usuario: usuario.codigo_usuario,
                nombre: usuario.nombre_completo,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        // ==========================
        // Respuesta
        // ==========================

        return res.status(200).json({

            ok: true,

            mensaje: 'Inicio de sesión exitoso.',

            token,

            usuario: {

                id: usuario.id,

                codigo_usuario: usuario.codigo_usuario,

                nombre: usuario.nombre_completo,

                email: usuario.email_personal,

                celular: usuario.celular_actual,

                rol: usuario.rol,

                estado_cuenta: usuario.estado_cuenta,

                estado_becario: usuario.estado_becario || null,

                ultimo_acceso: usuario.ultimo_acceso

            }

        });

    } catch (error) {

        console.error('Error en login:', error);

        return res.status(500).json({

            ok: false,

            mensaje: 'Ocurrió un error interno del servidor.'

        });

    }

};

module.exports = {
    login
};