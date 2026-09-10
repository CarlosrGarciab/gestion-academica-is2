require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const requiredValues = ['ADMIN_NAME', 'ADMIN_LASTNAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

const createAdmin = async () => {
  const missingValues = requiredValues.filter((key) => !process.env[key]);
  if (missingValues.length > 0) {
    throw new Error(`Faltan variables: ${missingValues.join(', ')}`);
  }

  if (process.env.ADMIN_PASSWORD.length < 8 || !/[A-Za-z]/.test(process.env.ADMIN_PASSWORD) || !/\d/.test(process.env.ADMIN_PASSWORD)) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 8 caracteres, una letra y un numero');
  }

  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const existingUser = await pool.query('SELECT id FROM USUARIO WHERE EMAIL = $1', [email]);
  if (existingUser.rowCount > 0) {
    throw new Error('Ya existe un usuario con ese email');
  }

  const role = await pool.query(
    "SELECT id_rol FROM ROL WHERE NOMBRE = 'Administrador' AND ACTIVO = TRUE"
  );
  if (role.rowCount === 0) {
    throw new Error('Rol Administrador no configurado');
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO USUARIO(nombre, apellido, email, password_hash, id_rol)
     VALUES($1, $2, $3, $4, $5)`,
    [
      process.env.ADMIN_NAME.trim(),
      process.env.ADMIN_LASTNAME.trim(),
      email,
      passwordHash,
      role.rows[0].id_rol
    ]
  );

  console.log(`Administrador creado: ${email}`);
};

createAdmin()
  .catch((error) => {
    console.error(`No se pudo crear el administrador: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());