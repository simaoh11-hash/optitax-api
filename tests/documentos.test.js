const { validarCpf, validarCnpj, somenteDigitos } = require('../src/utils/documentos');
const { competenciaMaisRecente } = require('../src/utils/competencia');

describe('documentos', () => {
  test('aceita CPF válido, com ou sem máscara', () => {
    expect(validarCpf('52998224725')).toBe(true);
    expect(validarCpf('529.982.247-25')).toBe(true);
  });

  test('rejeita CPF inválido ou com dígitos repetidos', () => {
    expect(validarCpf('52998224726')).toBe(false);
    expect(validarCpf('11111111111')).toBe(false);
    expect(validarCpf('123')).toBe(false);
  });

  test('valida CNPJ', () => {
    expect(validarCnpj('11.222.333/0001-81')).toBe(true);
    expect(validarCnpj('11222333000182')).toBe(false);
    expect(validarCnpj('00000000000000')).toBe(false);
  });

  test('somenteDigitos remove a máscara', () => {
    expect(somenteDigitos('529.982.247-25')).toBe('52998224725');
  });
});

describe('competencia', () => {
  test('retorna a competência mais recente', () => {
    expect(competenciaMaisRecente(['07/2026', '08/2026', '12/2025'])).toBe('08/2026');
  });
});
