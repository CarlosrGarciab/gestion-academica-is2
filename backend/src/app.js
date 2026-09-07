require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Gestión Académica CCGB ejecutándose correctamente' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error.message);
    res.status(503).json({ status: 'error', message: 'Base de datos no disponible' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
  });
}

module.exports = app;