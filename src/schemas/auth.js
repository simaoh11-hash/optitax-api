const { z } = require('zod');
const { somenteDigitos, validarCpf } = require('../utils/documentos');

const email = z
  .string({ required_error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .email('E-mail inválido.');

const senhaForte = z
  .string({ required_error: 'Informe uma senha.' })
  .min(8, 'A senha deve ter no mínimo 8 caracteres.');

const cadastro = z
  .object({
    nome: z.string({ required_error: 'Informe o nome.' }).trim().min(3, 'Informe o nome completo.'),
    cpf: z
      .string({ required_error: 'Informe o CPF.' })
      .refine(validarCpf, 'CPF inválido.')
      .transform(somenteDigitos),
    email,
    senha: senhaForte,
    confirmarSenha: z.string({ required_error: 'Confirme a senha.' }),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'],
  });

const login = z.object({
  email,
  senha: z.string({ required_error: 'Informe a senha.' }).min(1, 'Informe a senha.'),
});

const esqueciSenha = z.object({ email });

const redefinirSenha = z
  .object({
    token: z.string({ required_error: 'Token não informado.' }).min(1, 'Token não informado.'),
    senha: senhaForte,
    confirmarSenha: z.string({ required_error: 'Confirme a senha.' }),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'],
  });

module.exports = { cadastro, login, esqueciSenha, redefinirSenha };
