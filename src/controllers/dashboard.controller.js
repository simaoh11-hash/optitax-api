const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { REGEX_COMPETENCIA, competenciaMaisRecente } = require('../utils/competencia');

// Alimenta os quatro cards do dashboard do UI.
async function resumo(req, res) {
  const usuarioId = req.usuarioId;
  let { competencia } = req.query;

  if (competencia && !REGEX_COMPETENCIA.test(competencia)) {
    throw new AppError(400, 'Competência deve estar no formato MM/AAAA.');
  }

  const [obrigacoes, empresas] = await Promise.all([
    prisma.obrigacao.findMany({
      where: { usuarioId },
      select: { competencia: true, status: true, valor: true },
    }),
    prisma.empresa.findMany({ where: { usuarioId }, select: { documentosProcessados: true } }),
  ]);

  // Sem filtro, usa a competência mais recente cadastrada para o usuário
  competencia = competencia || competenciaMaisRecente(obrigacoes.map((o) => o.competencia));

  const tributosNoMes = obrigacoes
    .filter((o) => o.competencia === competencia)
    .reduce((soma, o) => soma + o.valor, 0);

  res.json({
    competencia,
    tributosNoMes,
    obrigacoesPendentes: obrigacoes.filter((o) => o.status === 'Pendente').length,
    documentosProcessados: empresas.reduce((soma, e) => soma + e.documentosProcessados, 0),
    alertasFiscais: obrigacoes.filter((o) => o.status === 'Atenção').length,
  });
}

module.exports = { resumo };
