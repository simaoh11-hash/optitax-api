# OptiTax API

API REST do **OptiTax – gestão tributária simplificada**, criada para o front-end
[`projetoUI`](https://github.com/SEU_USUARIO/projetoUI) (React + Vite).

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime / framework | Node.js 20+ e Express 4 |
| Banco de dados | SQLite (via Prisma ORM 6) – trocável por PostgreSQL alterando o `provider` |
| Autenticação | JWT (`jsonwebtoken`) + hash de senha com `bcryptjs` |
| Validação | Zod |
| Segurança | Helmet, CORS, rate limit nas rotas de `/auth` |
| Documentação | Swagger UI em `/docs` |
| Testes | Jest + Supertest |

## Como rodar

```bash
npm install
cp .env.example .env        # no Windows: copy .env.example .env
npm run db:push             # cria o banco SQLite (prisma/dev.db)
npm run db:seed             # dados de exemplo (opcional)
npm run dev                 # http://localhost:3333
```

- Swagger: http://localhost:3333/docs
- Login de teste (após o seed): `demo@optitax.com` / `Senha@123`
- Testes: `npm test`

## Endpoints (prefixo `/api`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | – | Verifica se a API está no ar |
| POST | `/auth/cadastro` | – | Cria conta (`nome`, `cpf`, `email`, `senha`, `confirmarSenha`) |
| POST | `/auth/login` | – | Retorna `{ token, usuario }` |
| GET | `/auth/me` | ✔ | Usuário autenticado |
| POST | `/auth/esqueci-senha` | – | Gera token de recuperação (válido por 30 min) |
| POST | `/auth/redefinir-senha` | – | Define nova senha com o token |
| GET | `/dashboard/resumo` | ✔ | Dados dos 4 cards do dashboard |
| GET/POST | `/obrigacoes` | ✔ | Lista (filtros `status`, `competencia`, `limite`) / cria |
| GET/PUT/DELETE | `/obrigacoes/:id` | ✔ | Detalha / atualiza / remove |
| GET/POST | `/empresas` | ✔ | Lista / cadastra ("Nova empresa") |

Erros seguem o formato `{ "erro": "mensagem", "detalhes": [...] }`.
Rotas protegidas exigem `Authorization: Bearer <token>`.

## Estrutura

```
prisma/        schema.prisma e seed
src/
  config/      variáveis de ambiente
  controllers/ regras de cada recurso
  middlewares/ auth (JWT), validação, erros
  routes/      definição das rotas
  schemas/     validações Zod
  utils/       validação de CPF/CNPJ, competência
  docs/        especificação OpenAPI
tests/         Jest + Supertest
docs/          guia de integração com o UI
```

## Organização das sprints (cards do Trello)

**Sprint 1 – Base e cadastro**
1. Estrutura do projeto Express, `.env`, CORS e tratamento de erros
2. Conexão com o banco e modelos Prisma
3. `POST /auth/cadastro` (hash de senha, CPF/e-mail únicos, validação de CPF)

**Sprint 2 – Autenticação**

4. `POST /auth/login` com JWT
5. Middleware de autenticação e `GET /auth/me`
6. Recuperação de senha (`/auth/esqueci-senha` e `/auth/redefinir-senha`)

**Sprint 3 – Dashboard**

7. `GET /dashboard/resumo`
8. CRUD de `/obrigacoes`
9. `POST /empresas` e documentação Swagger
10. Testes automatizados

## Fluxo Git sugerido

```bash
git init -b main
git add . && git commit -m "chore: estrutura inicial da API"
git remote add origin https://github.com/SEU_USUARIO/optitax-api.git
git push -u origin main

# uma branch por card do Trello
git checkout -b feat/auth-login
git commit -m "feat(auth): implementa login com JWT"
git push -u origin feat/auth-login   # abra o Pull Request / Merge Request
```

> Dica: este projeto é um **ponto de partida**. Leia cada arquivo, rode, quebre e
> entenda o que ele faz. Faça seus commits conforme você realmente avançar em cada card
> do Trello (integração com o UI, tela de redefinir senha, serviço de e-mail, mais
> testes, ajustes de regra de negócio). Um histórico honesto mostra seu progresso e
> facilita explicar o código na apresentação.

## Observações

- A recuperação de senha **não envia e-mail** ainda. Em `NODE_ENV=development` o token é
  impresso no console e devolvido em `tokenDev`. Para produção, integre um serviço de
  e-mail em `auth.controller.js` (há um `TODO` no ponto exato).
- Em produção defina `JWT_SECRET` e `NODE_ENV=production`.
- O projeto fixa Prisma na série 6.x (`url` dentro do `schema.prisma`).
