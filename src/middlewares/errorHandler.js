const AppError = require('../utils/AppError');
const { isProd } = require('../config/env');

function naoEncontrado(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message, detalhes: err.detalhes });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }

  console.error(err);
  return res.status(500).json({
    erro: 'Erro interno do servidor.',
    ...(isProd ? {} : { detalhe: err.message }),
  });
}

module.exports = { naoEncontrado, errorHandler };
