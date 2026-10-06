const AppError = require('../utils/AppError');

// Valida req.body com um schema Zod e substitui pelo resultado já normalizado.
function validate(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      const detalhes = resultado.error.issues.map((i) => ({
        campo: i.path.join('.'),
        mensagem: i.message,
      }));
      return next(new AppError(400, detalhes[0]?.mensagem || 'Dados inválidos.', detalhes));
    }
    req.body = resultado.data;
    return next();
  };
}

// Converte o parâmetro :id em inteiro.
function parseId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new AppError(400, 'Identificador inválido.'));
  }
  req.params.id = id;
  return next();
}

module.exports = { validate, parseId };
