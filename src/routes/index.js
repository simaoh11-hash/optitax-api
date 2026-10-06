const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { validate, parseId } = require('../middlewares/validate');
const { autenticar } = require('../middlewares/auth');
const authSchemas = require('../schemas/auth');
const obrigacaoSchemas = require('../schemas/obrigacao');
const empresaSchemas = require('../schemas/empresa');
const auth = require('../controllers/auth.controller');
const obrigacoes = require('../controllers/obrigacoes.controller');
const empresas = require('../controllers/empresas.controller');
const dashboard = require('../controllers/dashboard.controller');

// Express 4 não captura rejeições de handlers async: este wrapper repassa o erro ao errorHandler.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { erro: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Autenticação
router.post('/auth/cadastro', limitadorAuth, validate(authSchemas.cadastro), wrap(auth.cadastro));
router.post('/auth/login', limitadorAuth, validate(authSchemas.login), wrap(auth.login));
router.get('/auth/me', autenticar, wrap(auth.me));
router.post('/auth/esqueci-senha', limitadorAuth, validate(authSchemas.esqueciSenha), wrap(auth.esqueciSenha));
router.post('/auth/redefinir-senha', limitadorAuth, validate(authSchemas.redefinirSenha), wrap(auth.redefinirSenha));

// Rotas protegidas
router.use(autenticar);

router.get('/dashboard/resumo', wrap(dashboard.resumo));

router.get('/obrigacoes', wrap(obrigacoes.listar));
router.post('/obrigacoes', validate(obrigacaoSchemas.criar), wrap(obrigacoes.criar));
router.get('/obrigacoes/:id', parseId, wrap(obrigacoes.obter));
router.put('/obrigacoes/:id', parseId, validate(obrigacaoSchemas.atualizar), wrap(obrigacoes.atualizar));
router.delete('/obrigacoes/:id', parseId, wrap(obrigacoes.remover));

router.get('/empresas', wrap(empresas.listar));
router.post('/empresas', validate(empresaSchemas.criar), wrap(empresas.criar));

module.exports = router;
