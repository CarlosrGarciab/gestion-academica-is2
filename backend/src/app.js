require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
//const cursoRoutes = require('./routes/cursoRoutes'); // pendiente de migrar igual

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', usuarioRoutes);
//app.use('/api', cursoRoutes); Se comenta ya que aun no esta nada de cursos - Pendiente de Yanis

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Gestion Academica CCGB ejecutandose correctamente' });
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
    console.log(`Servidor ejecutandose en http://localhost:${port}`);
  });
}

module.exports = app;
