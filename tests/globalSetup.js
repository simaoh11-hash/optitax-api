// Cria/atualiza o schema do banco de testes (prisma/test.db) antes da suíte.
const { execSync } = require('child_process');

module.exports = async () => {
  execSync('npx prisma db push --skip-generate --force-reset', {
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
};
