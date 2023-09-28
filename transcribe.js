// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { assert } = require('okljs');
const path = require('path');
const fs = require('fs');

const operator_mapping =
  JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'operator_mapping.json')
    ).toString()
  )

const transcribeOperators = (string) => {
  assert.ok(typeof string === 'string');
  for (let om of operator_mapping) {
    string = string.replaceAll(om.ascii, om.utf8)
  }
  return string;
}

const reverseTranscribeOperators = (string) => {
  assert.ok(typeof string === 'string');
  for (let om of operator_mapping) {
    string = string.replaceAll(om.utf8, om.ascii)
  }
  return string;
}

module.exports.transcribeOperators = transcribeOperators;
module.exports.reverseTranscribeOperators = reverseTranscribeOperators;
