'use strict'

const { findAmodelsB, findAnotModelsB, generateRandomSentence } = require('./al_random.js');
const { getAllModels, enumerateInterpretations } = require('./al_models.js');
const { evaluateSentence } = require('./al_eval.js');
const { parse } = require('./al_parse.js');

describe('findAmodelsB', () => {

  let cache = [];
  let generator = () => generateRandomSentence({
    length: 3,
    letters_available: ['p', 'q', 'r'],
    letters_required: ['p', 'q', 'r'],
    operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
    operators_required: [],
    negation_probabilities: {
      atomic: { single: 0.4, double: 0.2 },
      complex: { single: 0.2, double: 0.0 },
    }
  });

  test.each([
    [ '( p & ( q | r ) )' ],
    [ '( p | ( q & r ) )' ],
    [ '( p -> ( q | r ) )' ],
    [ '( p | ( q -> r ) )' ],
    [ '( p -> ( q & r ) )' ],
    [ '( p & ( q -> r ) )' ]
  ])('findAmodelsB always finds sentence B with A models B', (A_) => {
    let A = parse(A_);
    for (let i = 0; i < 20; i++) {
      let B = findAmodelsB(A, generator, cache);

      let interpretations = enumerateInterpretations(['p', 'q', 'r']);
      for (let interpretation of interpretations) {
        if (evaluateSentence(A, interpretation)) {
          expect(evaluateSentence(B, interpretation)).toBe(true);
        }
      }
    }
  });

  test('findAmodelsB always finds sentence B with A models B, random sentences', () => {
    for (let j = 0; j < 20; j++) {
      let A = generator();
      for (let i = 0; i < 5; i++) {
        let B = findAmodelsB(A, generator, cache);

        let interpretations = enumerateInterpretations(['p', 'q', 'r']);
        for (let interpretation of interpretations) {
          if (evaluateSentence(A, interpretation)) {
            expect(evaluateSentence(B, interpretation)).toBe(true);
          }
        }
      }
    }
  });

  test('findAnotModelsB always finds sentence B with A not models B, random sentences', () => {
    for (let j = 0; j < 20; j++) {
      let A = generator();
      for (let i = 0; i < 5; i++) {
        let B = findAnotModelsB(A, generator, cache);

        let interpretations = enumerateInterpretations(['p', 'q', 'r']);
        let v = true;
        for (let interpretation of interpretations) {
          if (evaluateSentence(A, interpretation) && !evaluateSentence(B, interpretation)) {
            v = false;
          }
        }
        expect(v).toBe(false);
      }
    }
  });
});
