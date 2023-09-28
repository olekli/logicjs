// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { parse } = require('./al_parse.js');
const { evaluateSentence } = require('./al_eval.js');
const { getLettersInSentence, enumerateInterpretations, getAllModels, models } = require('./al_models.js');

test.each([
  [ '(p -> (q -> r))', ['p', 'q', 'r'] ],
  [ 'p', ['p'] ],
  [ 'q', ['q'] ],
  [ '(p -> (p -> p))', ['p'] ],
  [ '((p -> (q -> p)) <-> ((p -> r) & (q | r)))', ['p', 'q', 'r'] ],
])('getLettersInSentence', (string, result) => {
  expect(getLettersInSentence(parse(string))).toEqual(result);
});

test.each([
  [ ['p'], [ { p: true }, { p: false } ] ],
  [
    ['p', 'q'],
    [
      { p: true, q: true },
      { p: true, q: false },
      { p: false, q: true },
      { p: false, q: false }
    ]
  ],
  [
    ['p', 'q', 'r' ],
    [
      { p: true, q: true, r: true },
      { p: true, q: true, r: false},
      { p: true, q: false, r: true },
      { p: true, q: false, r: false },
      { p: false, q: true, r: true },
      { p: false, q: true, r: false },
      { p: false, q: false, r: true },
      { p: false, q: false, r: false }
    ]
  ],
])('enumerateInterpretations', (letters, result) => {
  expect(enumerateInterpretations(letters)).toEqual(result);
});

test.each([
  [ '(p -> (q -> r))' ],
  [ '((p & p) & (q & q))' ],
  [ '((p -> (q -> p)) <-> ((p -> r) & (q | r)))' ]
])('getAllModels', (s) => {
  let sentence = parse(s);
  let result = getAllModels(sentence);
  let num_interpretations = Math.pow(2, getLettersInSentence(sentence).length);
  expect(result.true.length + result.false.length).toEqual(num_interpretations);
  for (let i of result.true) {
    expect(evaluateSentence(sentence, i)).toBe(true);
  }
  for (let i of result.false) {
    expect(evaluateSentence(sentence, i)).toBe(false);
  }
});

test.each([
  [ 'p' ],
  [ 'q' ],
  [ '(p & !p)' ],
  [ '(p -> (q -> r))' ],
  [ '(p -> p)' ]
])('every sentence models tautology', (A_) => {
  let A = parse(A_);
  let B = parse('(p -> (q -> p))');
  expect(models(A, B)).toBe(true);
});

test.each([
  [ 'p' ],
  [ 'q' ],
  [ '(p -> (q -> r))' ],
  [ '(p -> p)' ]
])('no sentence models contradiction, except contradiction', (A_) => {
  let A = parse(A_);
  let B = parse('(q & !q)');
  expect(models(A, B)).toBe(false);
});

test.each([
  [ 'p' ],
  [ 'q' ],
  [ '(p & !p)' ],
  [ '(p -> (q -> r))' ],
  [ '(p -> p)' ]
])('contradiction models every sentence', (B_) => {
  let B = parse(B_);
  let A = parse('(q & !q)');
  expect(models(A, B)).toBe(true);
});

test.each([
  [ 'p' ],
  [ 'q' ],
  [ '(p & !p)' ],
  [ '(p -> (q -> r))' ],
  [ '(p -> p)' ]
])('every sentence models itself', (A_) => {
  let A = parse(A_);
  expect(models(A, A)).toBe(true);
});

//test.each([
//  [ 'p', { p: true }, true ],
//  [ 'p', { p: false }, false ],
//  [ 'p', { p: true, q: false }, true ],
//  [ 'p', { p: false, q: true }, false ],
//  [ '!p', { p: true }, false ],
//  [ '!p', { p: false }, true ],
//  [ '!p', { p: true, q: false }, false ],
//  [ '!p', { p: false, q: true }, true ],
//  [ '(p & q)', { p: true, q: true }, true ],
//  [ '(p & q)', { p: true, q: false }, false ],
//  [ '(p & q)', { p: false, q: true }, false ],
//  [ '(p & q)', { p: false, q: false }, false ],
//  [ '(p | q)', { p: true, q: true }, true ],
//  [ '(p | q)', { p: true, q: false }, true ],
//  [ '(p | q)', { p: false, q: true }, true ],
//  [ '(p | q)', { p: false, q: false }, false ],
//  [ '(p -> q)', { p: true, q: true }, true ],
//  [ '(p -> q)', { p: true, q: false }, false ],
//  [ '(p -> q)', { p: false, q: true }, true ],
//  [ '(p -> q)', { p: false, q: false }, true ],
//  [ '(p <-> q)', { p: true, q: true }, true ],
//  [ '(p <-> q)', { p: true, q: false }, false ],
//  [ '(p <-> q)', { p: false, q: true }, false ],
//  [ '(p <-> q)', { p: false, q: false }, true ],
//
//  [ '((p & p) & (q & q))', { p: true, q: true }, true ],
//  [ '((p & p) & (q & q))', { p: true, q: false }, false ],
//  [ '((p & p) & (q & q))', { p: false, q: true }, false ],
//  [ '((p & p) & (q & q))', { p: false, q: false }, false ],
//  [ '((p & p) | (q & q))', { p: true, q: true }, true ],
//  [ '((p & p) | (q & q))', { p: true, q: false }, true ],
//  [ '((p & p) | (q & q))', { p: false, q: true }, true ],
//  [ '((p & p) | (q & q))', { p: false, q: false }, false ],
//  [ '((p & p) -> (q & q))', { p: true, q: true }, true ],
//  [ '((p & p) -> (q & q))', { p: true, q: false }, false ],
//  [ '((p & p) -> (q & q))', { p: false, q: true }, true ],
//  [ '((p & p) -> (q & q))', { p: false, q: false }, true ],
//  [ '((p & p) <-> (q & q))', { p: true, q: true }, true ],
//  [ '((p & p) <-> (q & q))', { p: true, q: false }, false ],
//  [ '((p & p) <-> (q & q))', { p: false, q: true }, false ],
//  [ '((p & p) <-> (q & q))', { p: false, q: false }, true ],
//
//  [ '((p & r) & (q & r))', { p: true, q: true, r: true }, true ],
//  [ '((p & r) & (q & r))', { p: true, q: false, r: true }, false ],
//  [ '((p & r) & (q & r))', { p: false, q: true, r: true }, false ],
//  [ '((p & r) & (q & r))', { p: false, q: false, r: true }, false ],
//  [ '((p & r) | (q & r))', { p: true, q: true, r: true }, true ],
//  [ '((p & r) | (q & r))', { p: true, q: false, r: true }, true ],
//  [ '((p & r) | (q & r))', { p: false, q: true, r: true }, true ],
//  [ '((p & r) | (q & r))', { p: false, q: false, r: true }, false ],
//  [ '((p & r) -> (q & r))', { p: true, q: true, r: true }, true ],
//  [ '((p & r) -> (q & r))', { p: true, q: false, r: true }, false ],
//  [ '((p & r) -> (q & r))', { p: false, q: true, r: true }, true ],
//  [ '((p & r) -> (q & r))', { p: false, q: false, r: true }, true ],
//  [ '((p & r) <-> (q & r))', { p: true, q: true, r: true }, true ],
//  [ '((p & r) <-> (q & r))', { p: true, q: false, r: true }, false ],
//  [ '((p & r) <-> (q & r))', { p: false, q: true, r: true }, false ],
//  [ '((p & r) <-> (q & r))', { p: false, q: false, r: true }, true ],
//
//  [ '((p & r) & (q & r))', { p: true, q: true, r: false }, false ],
//  [ '((p & r) & (q & r))', { p: true, q: false, r: false }, false ],
//  [ '((p & r) & (q & r))', { p: false, q: true, r: false }, false ],
//  [ '((p & r) & (q & r))', { p: false, q: false, r: false }, false ],
//  [ '((p & r) | (q & r))', { p: true, q: true, r: false }, false ],
//  [ '((p & r) | (q & r))', { p: true, q: false, r: false }, false ],
//  [ '((p & r) | (q & r))', { p: false, q: true, r: false }, false ],
//  [ '((p & r) | (q & r))', { p: false, q: false, r: false }, false ],
//  [ '((p & r) -> (q & r))', { p: true, q: true, r: false }, true ],
//  [ '((p & r) -> (q & r))', { p: true, q: false, r: false }, true ],
//  [ '((p & r) -> (q & r))', { p: false, q: true, r: false }, true ],
//  [ '((p & r) -> (q & r))', { p: false, q: false, r: false }, true ],
//  [ '((p & r) <-> (q & r))', { p: true, q: true, r: false }, true ],
//  [ '((p & r) <-> (q & r))', { p: true, q: false, r: false }, true ],
//  [ '((p & r) <-> (q & r))', { p: false, q: true, r: false }, true ],
//  [ '((p & r) <-> (q & r))', { p: false, q: false, r: false }, true ]
//])('interpretation models sentence', (string, interpretation, result) => {
//  expect(models(make_type(interpretation, 'Interpretation'), parse(string))).toBe(result);
//});
