// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

const express = require('express');
const { app } = require('./app.js');
const morgan = require('morgan');
const path = require('path');
const config = require('./config.js');
const { deployLti } = require('./lti.js');
const { connectDatabase, closeDatabase } = require('./database.js');

// Setup Express App
const root = express();
root.use(morgan('combined'));
root.set('trust proxy', 1);
root.set('view engine', 'pug')

const root_router = express.Router();
root.use('/logicjs', root_router);

root_router.use('/app', app);
root_router.use('/static', express.static(path.join(__dirname, 'public')))

let server = null;

async function main() {
  console.log('Initialising database');
  await connectDatabase();

  if (config.is_production) {
    let lti = await deployLti();
    root_router.use('/lti', lti.app);
  }
  console.log('Starting root');
  server = await root.listen(3000);
  console.log('HTTP server running on port 3000');
}

async function shutdown() {
  console.log('Shutting down...');

  await server.close();
  await closeDatabase();
  process.exit(0);
}

main();

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
