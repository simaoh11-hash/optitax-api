const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`OptiTax API rodando em http://localhost:${port}`);
  console.log(`Documentação (Swagger): http://localhost:${port}/docs`);
});
