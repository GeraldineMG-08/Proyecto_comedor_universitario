const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();


// Middlewares
app.use(cors());
app.use(express.json());

const path = require('path');
const authRoutes =
    require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const restriccionRoutes = require('./routes/restriccionRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/restricciones', restriccionRoutes);
app.use('/api/reportes', reporteRoutes);

// Static uploads serving
app.use('/uploads/restricciones', express.static(path.join(__dirname, 'uploads/restricciones')));

app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});