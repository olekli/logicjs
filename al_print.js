'use strict'

const { assert } = require('okljs');
require('./al_eval.js');
const { transcribeOperators } = require('./transcribe.js');

const sentenceToString_ = (s) =>
  transcribeOperators(((s) => {
    if ('letter' in s) {
      return s.letter;
    } else if (s.operator === 'equivalent') {
      return '(' + sentenceToString_(s.lhs) + ' <-> ' + sentenceToString_(s.rhs) + ')';
    } else if (s.operator === 'follows') {
      return '(' + sentenceToString_(s.lhs) + ' -> ' + sentenceToString_(s.rhs) + ')';
    } else if (s.operator === 'and') {
      return '(' + sentenceToString_(s.lhs) + ' & ' + sentenceToString_(s.rhs) + ')';
    } else if (s.operator === 'or') {
      return '(' + sentenceToString_(s.lhs) + ' | ' + sentenceToString_(s.rhs) + ')';
    } else if (s.operator === 'not') {
      return '!' + sentenceToString_(s.operand);
    }
    assert.fail();
  })(s));

const sentenceToString = (s) => {
  assert.type(s, 'Sentence');
  return sentenceToString_(s);
}

module.exports.sentenceToString = sentenceToString;
