const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { corsOrigin } = require('./config/env');
const routes = require('./routes');
const openapi = require('./docs/openapi');
const { naoEncontrado, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: corsOrigin.split(',').map((o) => o.trim()) }));
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use('/api', routes);

app.use(naoEncontrado);
app.use(errorHandler);

module.exports = app;
