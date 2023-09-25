'use strict'

const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '.env.json')));
if (config.lti.platform.privateKey != '') {
  config.lti.platform.privateKey =
    fs.readFileSync(path.join(__dirname, config.lti.platform.privateKey));
}

module.exports = config;
