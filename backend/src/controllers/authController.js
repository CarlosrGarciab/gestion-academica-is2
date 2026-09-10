const authService = require('../services/authService')

const register = async (req, res) => {
  try 
  {
    const usuario = await authService.registrarUsuario(req.body);
    res.status(201).json(usuario);  
  } catch (error) 
  {
    res.status(400).json({message : error.message})
  }
};

const login = async(req, res) => {
  try{
    const {email, password} = req.body;
    const resultado = await authService.login(email, password);
    res.status(200).json(resultado);
  } catch (error)
  {
    res.status(400).json({message : error.message});
  }
};

module.exports = {
  register,
  login,
};