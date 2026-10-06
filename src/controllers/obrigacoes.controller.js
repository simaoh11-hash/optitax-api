const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { STATUS } = require('../schemas/obrigacao');

async function garantirEmpresaDoUsuario(empresaId, usuarioId) {
  if (empresaId === undefined || empresaId === null) return;
  const empresa = await prisma.empresa.findFirst({ where: { id: empresaId, usuarioId } });
  if (!empresa) throw new AppError(400, 'Empresa não encontrada.');
}

async function buscarDoUsuario(id, usuarioId) {
  const obrigacao = await prisma.obrigacao.findFirst({ where: { id, usuarioId } });
  if (!obrigacao) throw new AppError(404, 'Obrigação não encontrada.');
  return obrigacao;
}

async function listar(req, res) {
  const { status, competencia, limite } = req.query;

  if (status && !STATUS.includes(status)) {
    throw new AppError(400, 'Status deve ser Regular, Pendente ou Atenção.');
  }

  const take = limite ? Number(limite) : undefined;
  if (take !== undefined && (!Number.isInteger(take) || take < 1 || take > 100)) {
    throw new AppError(400, 'Limite deve ser um inteiro entre 1 e 100.');
  }

  const obrigacoes = await prisma.obrigacao.findMany({
    where: {
      usuarioId: req.usuarioId,
      ...(status ? { status } : {}),
      ...(competencia ? { competencia } : {}),
    },
    orderBy: { id: 'asc' },
    take,
  });

  res.json({ obrigacoes });
}

async function obter(req, res) {
  res.json({ obrigacao: await buscarDoUsuario(req.params.id, req.usuarioId) });
}

async function criar(req, res) {
  await garantirEmpresaDoUsuario(req.body.empresaId, req.usuarioId);
  const obrigacao = await prisma.obrigacao.create({
    data: { ...req.body, usuarioId: req.usuarioId },
  });
  res.status(201).json({ obrigacao });
}

async function atualizar(req, res) {
  await buscarDoUsuario(req.params.id, req.usuarioId);
  await garantirEmpresaDoUsuario(req.body.empresaId, req.usuarioId);
  const obrigacao = await prisma.obrigacao.update({ where: { id: req.params.id }, data: req.body });
  res.json({ obrigacao });
}

async function remover(req, res) {
  await buscarDoUsuario(req.params.id, req.usuarioId);
  await prisma.obrigacao.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

module.exports = { listar, obter, criar, atualizar, remover };
