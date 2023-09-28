// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { assert, register_type } = require('okljs');
const { evaluateSentence } = require('./al_eval.js');
const path = require('path');

register_type('Letters', path.join(__dirname, 'schema/type/Letters.yaml'));
register_type('Interpretations', path.join(__dirname, 'schema/type/Interpretations.yaml'));

const enumerateInterpretations = (letters) => {
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

const getLettersInSentence = (s) => {
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

const getAllModels = (s, letters) =>
{
  if (!letters) {
    letters = getLettersInSentence(s);
  }
  return enumerateInterpretations(letters).reduce(
    (result, i) => {
      if (evaluateSentence(s, i)) {
        result.true.push(i);
      } else {
        result.false.push(i);
      }
      return result;
    },
    { true: [], false: [] }
  );
}

const makeModelsSet = (s, letters) =>
  new Set(getAllModels(s, letters)[true].map((m) => JSON.stringify(m)));

const isSubSetOf = (lhs, rhs) => {
  for (let e of lhs) {
    if (!rhs.has(e)) {
      return false;
    }
  }
  return true;
}

const models = (lhs, rhs) => {
  let letters = Array.from(new Set([ ...getLettersInSentence(lhs), ...getLettersInSentence(rhs) ]));
  let lhs_models = makeModelsSet(lhs, letters);
  let rhs_models = makeModelsSet(rhs, letters);
  return isSubSetOf(lhs_models, rhs_models);
};

module.exports.enumerateInterpretations = enumerateInterpretations;
module.exports.getLettersInSentence = getLettersInSentence;
module.exports.getAllModels = getAllModels;
module.exports.models = models;
module.exports.makeModelsSet = makeModelsSet;
module.exports.isSubSetOf = isSubSetOf;
