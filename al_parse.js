'use strict'

const { assert } = require('okljs');
const nearley = require('nearley');
const grammar = require('./al_grammar.js');

let parse = (string) => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(string);
  assert.ok(parser.results.length === 1);
  return parser.results[0];
}

module.exports.parse = parse;
