'use strict'

const { assert } = require('okljs');
const { register_type } = require('okljs');

register_type('Letter', 'schema/type/Letter.json');
register_type('Sentence', 'schema/type/Sentence.json');
register_type('Interpretation', 'schema/type/Interpretation.json');
register_type('AtomicSentence', 'schema/type/AtomicSentence.json');
register_type('ComplexSentence', 'schema/type/ComplexSentence.json');
register_type('EquivalentSentence', 'schema/type/EquivalentSentence.json');
register_type('FollowsSentence', 'schema/type/FollowsSentence.json');
register_type('AndSentence', 'schema/type/AndSentence.json');
register_type('OrSentence', 'schema/type/OrSentence.json');
register_type('NotSentence', 'schema/type/NotSentence.json');

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
