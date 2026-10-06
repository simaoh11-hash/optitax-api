# Integrando o `projetoUI` à API

O UI atual guarda usuários no `localStorage` (inclusive a senha em texto puro).
Os passos abaixo substituem isso por chamadas à API.

## 1. Serviço de API

Crie `src/services/api.js` no projeto UI:

```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

async function request(caminho, { method = 'GET', body, token } = {}) {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (resposta.status === 204) return null;
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao comunicar com o servidor.');
  return dados;
}

export const api = {
  login: (email, senha) => request('/auth/login', { method: 'POST', body: { email, senha } }),
  cadastro: (dados) => request('/auth/cadastro', { method: 'POST', body: dados }),
  esqueciSenha: (email) => request('/auth/esqueci-senha', { method: 'POST', body: { email } }),
  resumo: (token) => request('/dashboard/resumo', { token }),
  obrigacoes: (token, limite = 4) => request(`/obrigacoes?limite=${limite}`, { token }),
  criarEmpresa: (token, dados) => request('/empresas', { method: 'POST', body: dados, token }),
};
```

Opcional: crie `.env` no UI com `VITE_API_URL=http://localhost:3333/api`.

## 2. Mudanças no `App.jsx`

| Função atual | Troca |
|---|---|
| `fazerLogin` | `const { token, usuario } = await api.login(email, senha)`; guardar `token` em estado (ou `sessionStorage`) |
| `criarConta` | `await api.cadastro({ nome, cpf, email: cadastroEmail, senha: cadastroSenha, confirmarSenha })` |
| `enviarRecuperacao` | `await api.esqueciSenha(recuperarEmail)` |
| array `obrigacoes` fixo | `api.obrigacoes(token)` dentro de um `useEffect` ao abrir o dashboard |
| números fixos dos cards | `api.resumo(token)` → `tributosNoMes`, `obrigacoesPendentes`, `documentosProcessados`, `alertasFiscais` |

Use `try/catch` e passe `error.message` para `setMensagem`, mantendo o `tipoMensagem` atual.

Formatação do valor dos cards:

```js
new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumo.tributosNoMes);
```

## 3. Diferenças de comportamento

- **Senha:** a API exige no mínimo 8 caracteres (o UI hoje aceita qualquer uma).
- **CPF:** é validado pelos dígitos verificadores; aceita com ou sem máscara.
- **Recuperação de senha:** a API responde sempre com sucesso, para não revelar quais
  e-mails existem. Por isso a mensagem "E-mail não encontrado no sistema." deixa de existir.
- **Redefinir senha:** o UI ainda não tem a tela que consome `POST /auth/redefinir-senha`
  (campos `token`, `senha`, `confirmarSenha`). Vale criar um card para ela.
- **CORS:** a API libera `http://localhost:5173` (porta padrão do Vite). Ajuste `CORS_ORIGIN` se precisar.
