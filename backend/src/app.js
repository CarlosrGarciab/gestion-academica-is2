require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const cohorteRoutes = require('./routes/cohorteRoutes');
const inscripcionRoutes = require('./routes/inscripcionRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesión. Intente más tarde.' },
});
app.use('/api/auth/login', loginLimiter);

app.use('/api', authRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', cursoRoutes);
app.use('/api', cohorteRoutes);
app.use('/api', inscripcionRoutes);

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

app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor ejecutandose en http://localhost:${port}`);
  });
}

module.exports = app;