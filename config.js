// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '.env.json')));
if (config.lti.platform.privateKey != '') {
  config.lti.platform.privateKey =
    fs.readFileSync(path.join(__dirname, config.lti.platform.privateKey));
}
config.version = execSync('git describe --tags').toString().replace(/[\r\n]/g, '');
config.is_production = (process.env.NODE_ENV === 'production');

module.exports = config;
