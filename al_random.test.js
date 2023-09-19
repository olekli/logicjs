'use strict'

const { findAmodelsB, findAnotModelsB, generateRandomSentence } = require('./al_random.js');
const { getAllModels, enumerateInterpretations, getLettersInSentence } = require('./al_models.js');
const { evaluateSentence } = require('./al_eval.js');
const { parse } = require('./al_parse.js');

describe('random tests', () => {

  let cache = {};
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
      let B = findAmodelsB(A, [ 'p', 'q', 'r' ], generator, cache);

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
        let B = findAmodelsB(A, [ 'p', 'q', 'r' ], generator, cache);

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
        let B = findAnotModelsB(A, [ 'p', 'q', 'r' ], generator, cache);

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

describe('corner cases', () => {
  describe('no shared cache', () => {
    test.each([
      [ '(p & p)', '(!q | p)' ],
      [ '(p & !p)', 'q' ],
      [ 'p', '(q -> q)' ],
    ])('findAmodelsB works with corner cases', (A_, B_) => {
      let cache = {};
      let A = parse(A_);
      let B = parse(B_);
      let result = findAmodelsB(A, [ 'p', 'q' ], () => B, cache);
      let interpretations = enumerateInterpretations(['p', 'q']);
      for (let interpretation of interpretations) {
        if (evaluateSentence(A, interpretation)) {
          expect(evaluateSentence(result, interpretation)).toBe(true);
        }
      }
    });

    test.each([
      [ '(p & p)', '(!q & q)' ],
      [ 'q', '(p & !p)' ],
      [ '(q -> q)', 'p' ],
    ])('findAnotModelsB works with corner cases', (A_, B_) => {
      let cache = {};
      let A = parse(A_);
      let B = parse(B_);
      let result = findAnotModelsB(A, [ 'p', 'q' ], () => B, cache);
      let interpretations = enumerateInterpretations(['p', 'q']);
      let v = true;
      for (let interpretation of interpretations) {
        if (evaluateSentence(A, interpretation) && !evaluateSentence(result, interpretation)) {
          v = false;
        }
      }
      expect(v).toBe(false);
    });
  });

  describe('shared cache', () => {
    let cache = {};

    test.each([
      [ 'p' ],
      [ '(p & (q | !q))' ],
      [ '(p & p)' ],
    ])('findAmodelsB finds correct match for corner case', (A_) => {
      let A = parse(A_);
      let result = findAmodelsB(A, getLettersInSentence(A), () => A, cache);
      let interpretations = enumerateInterpretations(getLettersInSentence(A));
      for (let interpretation of interpretations) {
        if (evaluateSentence(A, interpretation)) {
          expect(evaluateSentence(result, interpretation)).toBe(true);
        }
      }
    });

    test.each([
      [ 'p' ],
      [ '(p & (q | !q))' ],
      [ '(p & p)' ],
    ])('findAnotModelsB finds correct match for corner case', (A_) => {
      let A = parse(A_);
      let result = findAnotModelsB(
        A,
        getLettersInSentence(A),
        () => ({ operator: 'not', operand: A }),
        cache
      );
      let interpretations = enumerateInterpretations(getLettersInSentence(A));
      let v = true;
      for (let interpretation of interpretations) {
        if (evaluateSentence(A, interpretation) && !evaluateSentence(result, interpretation)) {
          v = false;
        }
      }
      expect(v).toBe(false);
    });

    test.each([
      [ '(p & p)', '(!q | p)' ],
      [ '(p & !p)', 'q' ],
      [ 'p', '(q -> q)' ],
    ])('findAmodelsB works with corner cases', (A_, B_) => {
      let A = parse(A_);
      let B = parse(B_);
      let result = findAmodelsB(A, [ 'p', 'q' ], () => B, cache);
      let interpretations = enumerateInterpretations(['p', 'q']);
      for (let interpretation of interpretations) {
        if (evaluateSentence(A, interpretation)) {
          expect(evaluateSentence(result, interpretation)).toBe(true);
        }
      }
    });

    test.each([
      [ '(p & p)', '(!q & q)' ],
      [ 'q', '(p & !p)' ],
      [ '(q -> q)', 'p' ],
    ])('findAnotModelsB works with corner cases', (A_, B_) => {
      let A = parse(A_);
      let B = parse(B_);
      let result = findAnotModelsB(A, [ 'p', 'q' ], () => B, cache);
      let interpretations = enumerateInterpretations(['p', 'q']);
      let v = true;
      for (let interpretation of interpretations) {
        if (evaluateSentence(A, interpretation) && !evaluateSentence(result, interpretation)) {
          v = false;
        }
      }
      expect(v).toBe(false);
    });
  });
});
