const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { jwtSecret, jwtExpiresIn, nodeEnv } = require('../config/env');

const SALT_ROUNDS = 10;
const VALIDADE_TOKEN_RECUPERACAO_MS = 30 * 60 * 1000;
// Hash falso usado para igualar o tempo de resposta quando o e-mail não existe
const HASH_FALSO = bcrypt.hashSync('senha-falsa', SALT_ROUNDS);

const sha256 = (valor) => crypto.createHash('sha256').update(valor).digest('hex');

const usuarioPublico = (u) => ({ id: u.id, nome: u.nome, email: u.email });

async function cadastro(req, res) {
  const { nome, cpf, email, senha } = req.body;

  const existente = await prisma.usuario.findFirst({
    where: { OR: [{ email }, { cpf }] },
    select: { id: true },
  });
  if (existente) throw new AppError(409, 'Usuário já cadastrado.');

  const usuario = await prisma.usuario.create({
    data: { nome, cpf, email, senhaHash: await bcrypt.hash(senha, SALT_ROUNDS) },
  });

  res.status(201).json({ mensagem: 'Conta criada com sucesso!', usuario: usuarioPublico(usuario) });
}

async function login(req, res) {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const senhaConfere = await bcrypt.compare(senha, usuario ? usuario.senhaHash : HASH_FALSO);

  if (!usuario || !senhaConfere) {
    throw new AppError(401, 'Usuário ou senha incorretos.');
  }

  const token = jwt.sign({}, jwtSecret, { subject: String(usuario.id), expiresIn: jwtExpiresIn });
  res.json({ token, usuario: usuarioPublico(usuario) });
}

async function me(req, res) {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } });
  if (!usuario) throw new AppError(401, 'Usuário não encontrado.');
  res.json({ usuario: usuarioPublico(usuario) });
}

async function esqueciSenha(req, res) {
  const { email } = req.body;
  const resposta = {
    mensagem: 'Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.',
  };

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return res.json(resposta);

  const token = crypto.randomBytes(32).toString('hex');

  // Invalida tokens anteriores ainda não usados e cria o novo
  await prisma.$transaction([
    prisma.tokenRecuperacao.deleteMany({ where: { usuarioId: usuario.id, usadoEm: null } }),
    prisma.tokenRecuperacao.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: sha256(token),
        expiraEm: new Date(Date.now() + VALIDADE_TOKEN_RECUPERACAO_MS),
      },
    }),
  ]);

  // TODO: integrar um serviço de e-mail (Nodemailer, Resend...) para enviar o link.
  // Em desenvolvimento, o token é exibido no console e devolvido na resposta para facilitar os testes.
  if (nodeEnv === 'development') {
    console.log(`[recuperação de senha] ${email} -> token: ${token}`);
    resposta.tokenDev = token;
  }

  return res.json(resposta);
}

async function redefinirSenha(req, res) {
  const { token, senha } = req.body;

  const registro = await prisma.tokenRecuperacao.findFirst({
    where: { tokenHash: sha256(token), usadoEm: null, expiraEm: { gt: new Date() } },
  });
  if (!registro) throw new AppError(400, 'Token inválido ou expirado.');

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { senhaHash: await bcrypt.hash(senha, SALT_ROUNDS) },
    }),
    prisma.tokenRecuperacao.update({ where: { id: registro.id }, data: { usadoEm: new Date() } }),
  ]);

  res.json({ mensagem: 'Senha redefinida com sucesso.' });
}

module.exports = { cadastro, login, me, esqueciSenha, redefinirSenha };
