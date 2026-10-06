const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');

async function listar(req, res) {
  const empresas = await prisma.empresa.findMany({
    where: { usuarioId: req.usuarioId },
    orderBy: { id: 'asc' },
  });
  res.json({ empresas });
}

async function criar(req, res) {
  const existente = await prisma.empresa.findFirst({
    where: { usuarioId: req.usuarioId, cnpj: req.body.cnpj },
    select: { id: true },
  });
  if (existente) throw new AppError(409, 'Empresa já cadastrada.');

  const empresa = await prisma.empresa.create({
    data: { ...req.body, usuarioId: req.usuarioId },
  });
  res.status(201).json({ empresa });
}

module.exports = { listar, criar };
