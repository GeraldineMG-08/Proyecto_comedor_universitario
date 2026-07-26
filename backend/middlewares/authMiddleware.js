const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                ok: false,

                mensaje: 'No se proporcionó el token.'

            });

        }

        if (!authHeader.startsWith('Bearer ')) {

            return res.status(401).json({

                ok: false,

                mensaje: 'Formato de token inválido.'

            });

        }

        const token = authHeader.split(' ')[1];

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Información disponible para los controladores
        req.usuario = payload;

        next();

    } catch (error) {

        return res.status(401).json({

            ok: false,

            mensaje: 'Token inválido o expirado.'

        });

    }

};

module.exports = {
    verificarToken
};