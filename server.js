const express = require('express');
const { app } = require('./app.js');
const morgan = require('morgan');
const path = require('path');
const config = require('./config.js');
const { deployLti } = require('./lti.js');

// Setup Express App
const server = express();
server.use(morgan('combined'));
server.set('trust proxy', 1);

const server_router = express.Router();
server.use('/logicjs', server_router);

server_router.use('/app', app);
server_router.use('/static', express.static(path.join(__dirname, 'public')))

async function main() {
  if (config.is_production) {
    let lti = await deployLti();
    server_router.use('/lti', lti.app);
  }
  await server.listen(3000);
  console.log('HTTP server running on port 3000');
}

main();
