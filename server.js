const express = require('express');
const { app } = require('./app.js');
const morgan = require('morgan');

// Setup Express App
const server = express();
server.use(morgan('combined'));
server.set('trust proxy', 1);

const server_router = express.Router();
server.use('/logicjs', server_router);

server_router.use('/app', app);

async function main() {
  await server.listen(3000);
  console.log('HTTP server running on port 3000');
}

main();
