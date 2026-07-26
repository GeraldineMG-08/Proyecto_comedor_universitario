const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();


// Middlewares
app.use(cors());
app.use(express.json());

const authRoutes =
    require('./routes/authRoutes');

app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});