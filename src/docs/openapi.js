const erro = { $ref: '#/components/schemas/Erro' };
const seguro = [{ bearerAuth: [] }];
const json = (schema) => ({ 'application/json': { schema } });
const resp = (descricao, schema) => ({ description: descricao, ...(schema ? { content: json(schema) } : {}) });
const id = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'OptiTax API',
    version: '1.0.0',
    description: 'API REST do OptiTax - gestão tributária simplificada.',
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Autenticação' },
    { name: 'Dashboard' },
    { name: 'Obrigações' },
    { name: 'Empresas' },
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Erro: {
        type: 'object',
        properties: {
          erro: { type: 'string' },
          detalhes: { type: 'array', items: { type: 'object', properties: { campo: { type: 'string' }, mensagem: { type: 'string' } } } },
        },
      },
      Usuario: {
        type: 'object',
        properties: { id: { type: 'integer' }, nome: { type: 'string' }, email: { type: 'string' } },
      },
      Obrigacao: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          documento: { type: 'string', example: 'DAS - Simples Nacional' },
          competencia: { type: 'string', example: '08/2026' },
          status: { type: 'string', enum: ['Regular', 'Pendente', 'Atenção'] },
          valor: { type: 'number', example: 9200 },
          empresaId: { type: 'integer', nullable: true },
        },
      },
      ObrigacaoEntrada: {
        type: 'object',
        required: ['documento', 'competencia'],
        properties: {
          documento: { type: 'string' },
          competencia: { type: 'string', example: '08/2026' },
          status: { type: 'string', enum: ['Regular', 'Pendente', 'Atenção'], default: 'Pendente' },
          valor: { type: 'number', default: 0 },
          empresaId: { type: 'integer', nullable: true },
        },
      },
      Empresa: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          razaoSocial: { type: 'string' },
          cnpj: { type: 'string', example: '11222333000181' },
          documentosProcessados: { type: 'integer' },
        },
      },
    },
  },
  paths: {
    '/auth/cadastro': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cria uma conta',
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['nome', 'cpf', 'email', 'senha', 'confirmarSenha'],
            properties: {
              nome: { type: 'string' },
              cpf: { type: 'string', example: '529.982.247-25' },
              email: { type: 'string' },
              senha: { type: 'string', minLength: 8 },
              confirmarSenha: { type: 'string' },
            },
          }),
        },
        responses: { 201: resp('Conta criada'), 400: resp('Dados inválidos', erro), 409: resp('Usuário já cadastrado', erro) },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica e retorna um JWT',
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['email', 'senha'],
            properties: { email: { type: 'string' }, senha: { type: 'string' } },
          }),
        },
        responses: {
          200: resp('Autenticado', {
            type: 'object',
            properties: { token: { type: 'string' }, usuario: { $ref: '#/components/schemas/Usuario' } },
          }),
          401: resp('Credenciais inválidas', erro),
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autenticação'],
        summary: 'Dados do usuário autenticado',
        security: seguro,
        responses: { 200: resp('OK'), 401: resp('Não autenticado', erro) },
      },
    },
    '/auth/esqueci-senha': {
      post: {
        tags: ['Autenticação'],
        summary: 'Solicita a recuperação de senha',
        description: 'Sempre responde 200 para não revelar quais e-mails existem. Em desenvolvimento, a resposta inclui `tokenDev`.',
        requestBody: { required: true, content: json({ type: 'object', required: ['email'], properties: { email: { type: 'string' } } }) },
        responses: { 200: resp('Solicitação registrada') },
      },
    },
    '/auth/redefinir-senha': {
      post: {
        tags: ['Autenticação'],
        summary: 'Redefine a senha com o token recebido',
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['token', 'senha', 'confirmarSenha'],
            properties: { token: { type: 'string' }, senha: { type: 'string' }, confirmarSenha: { type: 'string' } },
          }),
        },
        responses: { 200: resp('Senha redefinida'), 400: resp('Token inválido ou expirado', erro) },
      },
    },
    '/dashboard/resumo': {
      get: {
        tags: ['Dashboard'],
        summary: 'Métricas dos cards do dashboard',
        security: seguro,
        parameters: [{ name: 'competencia', in: 'query', schema: { type: 'string', example: '08/2026' } }],
        responses: {
          200: resp('OK', {
            type: 'object',
            properties: {
              competencia: { type: 'string' },
              tributosNoMes: { type: 'number' },
              obrigacoesPendentes: { type: 'integer' },
              documentosProcessados: { type: 'integer' },
              alertasFiscais: { type: 'integer' },
            },
          }),
        },
      },
    },
    '/obrigacoes': {
      get: {
        tags: ['Obrigações'],
        summary: 'Lista as obrigações do usuário',
        security: seguro,
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Regular', 'Pendente', 'Atenção'] } },
          { name: 'competencia', in: 'query', schema: { type: 'string' } },
          { name: 'limite', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
        ],
        responses: { 200: resp('OK') },
      },
      post: {
        tags: ['Obrigações'],
        summary: 'Cria uma obrigação',
        security: seguro,
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/ObrigacaoEntrada' }) },
        responses: { 201: resp('Criada'), 400: resp('Dados inválidos', erro) },
      },
    },
    '/obrigacoes/{id}': {
      parameters: [id],
      get: { tags: ['Obrigações'], summary: 'Detalha uma obrigação', security: seguro, responses: { 200: resp('OK'), 404: resp('Não encontrada', erro) } },
      put: {
        tags: ['Obrigações'],
        summary: 'Atualiza uma obrigação (campos parciais)',
        security: seguro,
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/ObrigacaoEntrada' }) },
        responses: { 200: resp('Atualizada'), 404: resp('Não encontrada', erro) },
      },
      delete: { tags: ['Obrigações'], summary: 'Remove uma obrigação', security: seguro, responses: { 204: resp('Removida'), 404: resp('Não encontrada', erro) } },
    },
    '/empresas': {
      get: { tags: ['Empresas'], summary: 'Lista as empresas do usuário', security: seguro, responses: { 200: resp('OK') } },
      post: {
        tags: ['Empresas'],
        summary: 'Cadastra uma empresa',
        security: seguro,
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['razaoSocial', 'cnpj'],
            properties: { razaoSocial: { type: 'string' }, cnpj: { type: 'string' }, documentosProcessados: { type: 'integer', default: 0 } },
          }),
        },
        responses: { 201: resp('Criada'), 409: resp('Empresa já cadastrada', erro) },
      },
    },
  },
};
