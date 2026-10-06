// Popula o banco com dados equivalentes aos exibidos no dashboard do UI.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.obrigacao.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.tokenRecuperacao.deleteMany();
  await prisma.usuario.deleteMany();

  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Administrador Demo',
      cpf: '52998224725', // CPF válido de exemplo
      email: 'demo@optitax.com',
      senhaHash: await bcrypt.hash('Senha@123', 10),
    },
  });

  const empresa = await prisma.empresa.create({
    data: {
      usuarioId: usuario.id,
      razaoSocial: 'Empresa Demo LTDA',
      cnpj: '11222333000181', // CNPJ válido de exemplo
      documentosProcessados: 128,
    },
  });

  const base = { usuarioId: usuario.id, empresaId: empresa.id };
  await prisma.obrigacao.createMany({
    data: [
      { ...base, documento: 'DAS - Simples Nacional', competencia: '08/2026', status: 'Regular', valor: 9200 },
      { ...base, documento: 'EFD ICMS/IPI', competencia: '07/2026', status: 'Pendente', valor: 0 },
      { ...base, documento: 'PGDAS-D', competencia: '08/2026', status: 'Regular', valor: 6250 },
      { ...base, documento: 'Relatório fiscal', competencia: '08/2026', status: 'Atenção', valor: 3000 },
      { ...base, documento: 'DCTF', competencia: '08/2026', status: 'Pendente', valor: 0 },
      { ...base, documento: 'SPED Contribuições', competencia: '07/2026', status: 'Pendente', valor: 0 },
      { ...base, documento: 'GIA', competencia: '07/2026', status: 'Pendente', valor: 0 },
      { ...base, documento: 'ECF', competencia: '08/2026', status: 'Atenção', valor: 0 },
    ],
  });

  console.log('Seed concluído. Login de teste: demo@optitax.com / Senha@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
