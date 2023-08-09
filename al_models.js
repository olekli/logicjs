'use strict'

const { assert, register_type } = require('okljs');
const { evaluateSentence } = require('./al_eval.js');

register_type('Letters', 'schema/type/Letters.yaml');
register_type('Interpretations', 'schema/type/Interpretations.yaml');

let enumerateInterpretations = (letters) => {
  let result = letters.reduce((result, this_letter) =>
    result.flatMap(this_interpretation => [
      { ...this_interpretation, [this_letter]: true },
      { ...this_interpretation, [this_letter]: false }
    ]),
    [{}]
  );
  assert.type(result, 'Interpretations');
  return result;
};

let getLettersInSentence = (s) => {
  let visit = (s) => {
    if ('letter' in s) {
      return [s.letter];
    } else if ('operand' in s) {
      return [visit(s.operand)].flat();
    } else if (('lhs' in s) && ('rhs' in s)) {
      return [visit(s.lhs), visit(s.rhs)].flat()
    }
    assert.fail();
  };
  let set = new Set(visit(s));
  let result = [...set];
  result.sort();
  return result;
};

//let getAllModels = (s) => {
//  let interpretations = enumerateInterpretations(getLettersInSentence(s));
//  return interpretations.filter(i => evaluateSentence(s, i));
//};

//let models = (lhs, rhs) => {
//  assert.type(rhs, 'Sentence');
//  if (
//    {
//      Interpretation: () => evaluateSentence(rhs, lhs)
//    });
//};

module.exports.enumerateInterpretations = enumerateInterpretations;
module.exports.getLettersInSentence = getLettersInSentence;
//module.exports.models = models;