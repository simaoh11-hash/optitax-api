const { z } = require('zod');
const { somenteDigitos, validarCnpj } = require('../utils/documentos');

const criar = z.object({
  razaoSocial: z.string({ required_error: 'Informe a razão social.' }).trim().min(3, 'Informe a razão social.'),
  cnpj: z
    .string({ required_error: 'Informe o CNPJ.' })
    .refine(validarCnpj, 'CNPJ inválido.')
    .transform(somenteDigitos),
  documentosProcessados: z.number().int().min(0).default(0),
});

module.exports = { criar };
