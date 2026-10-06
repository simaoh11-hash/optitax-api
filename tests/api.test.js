const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

const usuario = {
  nome: 'Maria Teste',
  cpf: '529.982.247-25',
  email: 'Maria@Teste.com',
  senha: 'Senha@123',
  confirmarSenha: 'Senha@123',
};

let token;

beforeAll(async () => {
  await prisma.obrigacao.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.tokenRecuperacao.deleteMany();
  await prisma.usuario.deleteMany();
});

afterAll(() => prisma.$disconnect());

describe('autenticação', () => {
  test('cadastra usuário', async () => {
    const res = await request(app).post('/api/auth/cadastro').send(usuario);
    expect(res.status).toBe(201);
    expect(res.body.usuario.email).toBe('maria@teste.com');
    expect(res.body.usuario.senhaHash).toBeUndefined();
  });

  test('rejeita cadastro duplicado', async () => {
    const res = await request(app).post('/api/auth/cadastro').send(usuario);
    expect(res.status).toBe(409);
  });

  test('rejeita senhas diferentes', async () => {
    const res = await request(app)
      .post('/api/auth/cadastro')
      .send({ ...usuario, email: 'outra@teste.com', confirmarSenha: 'diferente' });
    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('As senhas não coincidem.');
  });

  test('rejeita login com senha errada', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: usuario.email, senha: 'errada' });
    expect(res.status).toBe(401);
  });

  test('faz login e acessa /auth/me', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: usuario.email, senha: usuario.senha });
    expect(login.status).toBe(200);
    token = login.body.token;

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.usuario.nome).toBe('Maria Teste');
  });

  test('bloqueia rota protegida sem token', async () => {
    const res = await request(app).get('/api/dashboard/resumo');
    expect(res.status).toBe(401);
  });
});

describe('recuperação de senha', () => {
  test('responde 200 mesmo para e-mail inexistente', async () => {
    const res = await request(app).post('/api/auth/esqueci-senha').send({ email: 'nao@existe.com' });
    expect(res.status).toBe(200);
  });
});

describe('obrigações e dashboard', () => {
  let obrigacaoId;

  test('cria obrigação', async () => {
    const res = await request(app)
      .post('/api/obrigacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ documento: 'DAS - Simples Nacional', competencia: '08/2026', status: 'Regular', valor: 1000 });
    expect(res.status).toBe(201);
    obrigacaoId = res.body.obrigacao.id;
  });

  test('rejeita competência inválida', async () => {
    const res = await request(app)
      .post('/api/obrigacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ documento: 'DAS', competencia: '13/2026' });
    expect(res.status).toBe(400);
  });

  test('lista, atualiza e remove', async () => {
    const auth = { Authorization: `Bearer ${token}` };

    const lista = await request(app).get('/api/obrigacoes').set(auth);
    expect(lista.body.obrigacoes).toHaveLength(1);

    const upd = await request(app).put(`/api/obrigacoes/${obrigacaoId}`).set(auth).send({ status: 'Pendente' });
    expect(upd.body.obrigacao.status).toBe('Pendente');

    const resumo = await request(app).get('/api/dashboard/resumo').set(auth);
    expect(resumo.body).toMatchObject({ competencia: '08/2026', tributosNoMes: 1000, obrigacoesPendentes: 1 });

    const del = await request(app).delete(`/api/obrigacoes/${obrigacaoId}`).set(auth);
    expect(del.status).toBe(204);
  });
});
