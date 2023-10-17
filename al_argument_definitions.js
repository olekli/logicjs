// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { assert } = require('okljs');
const { parse } = require('./al_parse.js');
const { ajv } = require('./validation.js');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const Arguments = yaml.load(fs.readFileSync(path.join(__dirname, 'al_argument_definitions.yaml')));

for (let argument_list in Arguments) {
  for (let argument of Arguments[argument_list]) {
    argument.premises =
      argument.premises.map((p) => ({ type: p.type, sentence: parse(p.sentence) }));
    argument.conclusion = parse(argument.conclusion);
  }
}

let validate = ajv.getSchema('/type/Arguments');
if (!validate(Arguments)) {
  assert.fail(() => `${JSON.stringify(validate.errors, null, 2)}`);
}

module.exports.Arguments = Arguments;
