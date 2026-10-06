const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { jwtSecret } = require('../config/env');

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new AppError(401, 'Token de autenticação não informado.'));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.usuarioId = Number(payload.sub);
    return next();
  } catch {
    return next(new AppError(401, 'Token inválido ou expirado.'));
  }
}

module.exports = { autenticar };
