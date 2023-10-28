// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const fs = require('fs');
const path = require('path');
const { fileExists, ok } = require('okljs');
const { execSync } = require('child_process');

const Config = {};

const config_path = path.join(__dirname, '.env.json');

const setConfig = (new_config) => {
  for (let key in Config) {
    delete Config[key];
  }
  Object.assign(Config, new_config);
};

if (ok(fileExists(config_path))) {
  setConfig(JSON.parse(fs.readFileSync(config_path)));
  if (Config.lti.platform.privateKey != '') {
    Config.lti.platform.privateKey =
      fs.readFileSync(path.join(__dirname, Config.lti.platform.privateKey));
  }
  Config.version = execSync('git describe --tags').toString().replace(/[\r\n]/g, '');
  Config.is_production = (process.env.NODE_ENV === 'production');
}

module.exports.config = Config;
module.exports.setConfig = setConfig;
