// Competência no formato MM/AAAA
const REGEX_COMPETENCIA = /^(0[1-9]|1[0-2])\/\d{4}$/;

function chaveOrdenacao(competencia) {
  const [mes, ano] = competencia.split('/');
  return Number(ano) * 100 + Number(mes);
}

function competenciaAtual(data = new Date()) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${mes}/${data.getFullYear()}`;
}

// Retorna a competência mais recente da lista (ou a atual se vazia)
function competenciaMaisRecente(competencias) {
  if (!competencias.length) return competenciaAtual();
  return [...competencias].sort((a, b) => chaveOrdenacao(b) - chaveOrdenacao(a))[0];
}

module.exports = { REGEX_COMPETENCIA, competenciaAtual, competenciaMaisRecente };
