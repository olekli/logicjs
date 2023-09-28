// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { assert } = require('okljs');
const { register_type } = require('okljs');
const path = require('path');

register_type('Letter', path.join(__dirname, 'schema/type/Letter.yaml'));
register_type('Sentence', path.join(__dirname, 'schema/type/Sentence.yaml'));
register_type('Interpretation', path.join(__dirname, 'schema/type/Interpretation.yaml'));
register_type('AtomicSentence', path.join(__dirname, 'schema/type/AtomicSentence.yaml'));
register_type('ComplexSentence', path.join(__dirname, 'schema/type/ComplexSentence.yaml'));
register_type('EquivalentSentence', path.join(__dirname, 'schema/type/EquivalentSentence.yaml'));
register_type('FollowsSentence', path.join(__dirname, 'schema/type/FollowsSentence.yaml'));
register_type('AndSentence', path.join(__dirname, 'schema/type/AndSentence.yaml'));
register_type('OrSentence', path.join(__dirname, 'schema/type/OrSentence.yaml'));
register_type('NotSentence', path.join(__dirname, 'schema/type/NotSentence.yaml'));

const evaluateAtomicSentence = (s, i) => {
  assert.hasProperty(i, s.letter);
  return i[s.letter];
}

const evaluateComplexSentence = (s, i) => {
  if (s.operator === 'equivalent') {
    return evaluateSentence_(s.lhs, i) == evaluateSentence_(s.rhs, i);
  } else if (s.operator === 'follows') {
    return !evaluateSentence_(s.lhs, i) || evaluateSentence_(s.rhs, i);
  } else if (s.operator === 'and') {
    return evaluateSentence_(s.lhs, i) && evaluateSentence_(s.rhs, i);
  } else if (s.operator === 'or') {
    return evaluateSentence_(s.lhs, i) || evaluateSentence_(s.rhs, i);
  } else if (s.operator === 'not') {
    return !evaluateSentence_(s.operand, i);
  }
  assert.fail();
}

const evaluateSentence_ = (s, i) => {
  assert.isObject(s);
  if ('letter' in s) {
    return evaluateAtomicSentence(s, i);
  } else if ('operator' in s) {
    return evaluateComplexSentence(s, i);
  }
  assert.fail();
}

const evaluateSentence = (s, i) => {
  assert.type(s, 'Sentence');
  assert.type(i, 'Interpretation');
  return evaluateSentence_(s, i);
}

module.exports.evaluateSentence = evaluateSentence;
