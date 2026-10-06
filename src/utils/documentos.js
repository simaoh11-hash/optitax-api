// Validação de CPF e CNPJ (dígitos verificadores)

function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

function validarCpf(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcula = (tamanho) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcula(9) === Number(cpf[9]) && calcula(10) === Number(cpf[10]);
}

function validarCnpj(valor) {
  const cnpj = somenteDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcula = (tamanho) => {
    const pesos = tamanho === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cnpj[i]) * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  return calcula(12) === Number(cnpj[12]) && calcula(13) === Number(cnpj[13]);
}

module.exports = { somenteDigitos, validarCpf, validarCnpj };
