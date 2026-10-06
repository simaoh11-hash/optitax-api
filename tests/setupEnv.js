// Executa antes de cada arquivo de teste: usa um banco SQLite separado.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'segredo-de-teste';
