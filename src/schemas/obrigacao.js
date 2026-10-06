const { z } = require('zod');
const { REGEX_COMPETENCIA } = require('../utils/competencia');

const STATUS = ['Regular', 'Pendente', 'Atenção'];

const campos = {
  documento: z.string({ required_error: 'Informe o documento.' }).trim().min(2, 'Informe o documento.'),
  competencia: z
    .string({ required_error: 'Informe a competência.' })
    .regex(REGEX_COMPETENCIA, 'Competência deve estar no formato MM/AAAA.'),
  status: z.enum(STATUS, { errorMap: () => ({ message: 'Status deve ser Regular, Pendente ou Atenção.' }) }),
  valor: z.number({ invalid_type_error: 'Valor deve ser numérico.' }).min(0, 'Valor não pode ser negativo.'),
  empresaId: z.number().int().positive().nullable(),
};

const criar = z.object({
  documento: campos.documento,
  competencia: campos.competencia,
  status: campos.status.default('Pendente'),
  valor: campos.valor.default(0),
  empresaId: campos.empresaId.optional(),
});

const atualizar = z
  .object({
    documento: campos.documento,
    competencia: campos.competencia,
    status: campos.status,
    valor: campos.valor,
    empresaId: campos.empresaId,
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Informe ao menos um campo para atualizar.' });

module.exports = { STATUS, criar, atualizar };
