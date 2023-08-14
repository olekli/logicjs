'use strict'

const { assert } = require('okljs');

const fs = require('fs');

const operator_mapping = JSON.parse(fs.readFileSync('operator_mapping.json').toString())

function transcribeOperators(string) {
  assert.ok(typeof string === 'string');
  for (let om of operator_mapping) {
    string = string.replaceAll(om.ascii, om.utf8)
  }
  return string;
}

module.exports.transcribeOperators = transcribeOperators;
