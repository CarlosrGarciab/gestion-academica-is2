const register = (req, res) => {
  res.status(501).json({ message: 'Registro aún no implementado' });
};

const login = (req, res) => {
  res.status(501).json({ message: 'Inicio de sesión aún no implementado' });
};

module.exports = {
  register,
  login,
};