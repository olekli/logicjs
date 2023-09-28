// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { makeInterpretation, evaluateSentence } = require('./al_eval.js');
const { parse } = require('./al_parse.js');

test.each([
  [''],
  ['()'],
  ['(p)'],
  ['('],
  ['(r'],
  ['pq'],
  ['!(p)'],
  ['!p|q'],
  ['(p<->q) -> (q <-> p)'],
  ['(p & q & r)'],
  ['(p | q | r)'],
  ['(p -> q -> r)'],
  ['(p <-> q <-> r)'],
])('evaluate invalid expression', (string) => {
  expect(() => evaluateSentence(parse(string), [ { letter: 'p', value: true }, { letter: 'q', value: false } ] )).toThrow();
});

test.each([
  ['p', { q: true }],
  ['q', { p: true }],
  ['(p & q)', { q: true }],
  ['(p & q)', { p: true }],
  ['(p & q)', { q: true, r: false }],
  ['(p & q)', { p: true, r: true }],
])('evaluate missing letter', (string, interpretation) => {
  expect(() => evaluateSentence(parse(string), interpretation)).toThrow();
});

test.each([
  [ 'p', { p: true }, true ],
  [ 'p', { p: false }, false ],
  [ 'p', { p: true, q: false }, true ],
  [ 'p', { p: false, q: true }, false ],
  [ '!p', { p: true }, false ],
  [ '!p', { p: false }, true ],
  [ '!p', { p: true, q: false }, false ],
  [ '!p', { p: false, q: true }, true ],
  [ '(p & q)', { p: true, q: true }, true ],
  [ '(p & q)', { p: true, q: false }, false ],
  [ '(p & q)', { p: false, q: true }, false ],
  [ '(p & q)', { p: false, q: false }, false ],
  [ '(p | q)', { p: true, q: true }, true ],
  [ '(p | q)', { p: true, q: false }, true ],
  [ '(p | q)', { p: false, q: true }, true ],
  [ '(p | q)', { p: false, q: false }, false ],
  [ '(p -> q)', { p: true, q: true }, true ],
  [ '(p -> q)', { p: true, q: false }, false ],
  [ '(p -> q)', { p: false, q: true }, true ],
  [ '(p -> q)', { p: false, q: false }, true ],
  [ '(p <-> q)', { p: true, q: true }, true ],
  [ '(p <-> q)', { p: true, q: false }, false ],
  [ '(p <-> q)', { p: false, q: true }, false ],
  [ '(p <-> q)', { p: false, q: false }, true ],

  [ '((p & p) & (q & q))', { p: true, q: true }, true ],
  [ '((p & p) & (q & q))', { p: true, q: false }, false ],
  [ '((p & p) & (q & q))', { p: false, q: true }, false ],
  [ '((p & p) & (q & q))', { p: false, q: false }, false ],
  [ '((p & p) | (q & q))', { p: true, q: true }, true ],
  [ '((p & p) | (q & q))', { p: true, q: false }, true ],
  [ '((p & p) | (q & q))', { p: false, q: true }, true ],
  [ '((p & p) | (q & q))', { p: false, q: false }, false ],
  [ '((p & p) -> (q & q))', { p: true, q: true }, true ],
  [ '((p & p) -> (q & q))', { p: true, q: false }, false ],
  [ '((p & p) -> (q & q))', { p: false, q: true }, true ],
  [ '((p & p) -> (q & q))', { p: false, q: false }, true ],
  [ '((p & p) <-> (q & q))', { p: true, q: true }, true ],
  [ '((p & p) <-> (q & q))', { p: true, q: false }, false ],
  [ '((p & p) <-> (q & q))', { p: false, q: true }, false ],
  [ '((p & p) <-> (q & q))', { p: false, q: false }, true ],

  [ '((p & r) & (q & r))', { p: true, q: true, r: true }, true ],
  [ '((p & r) & (q & r))', { p: true, q: false, r: true }, false ],
  [ '((p & r) & (q & r))', { p: false, q: true, r: true }, false ],
  [ '((p & r) & (q & r))', { p: false, q: false, r: true }, false ],
  [ '((p & r) | (q & r))', { p: true, q: true, r: true }, true ],
  [ '((p & r) | (q & r))', { p: true, q: false, r: true }, true ],
  [ '((p & r) | (q & r))', { p: false, q: true, r: true }, true ],
  [ '((p & r) | (q & r))', { p: false, q: false, r: true }, false ],
  [ '((p & r) -> (q & r))', { p: true, q: true, r: true }, true ],
  [ '((p & r) -> (q & r))', { p: true, q: false, r: true }, false ],
  [ '((p & r) -> (q & r))', { p: false, q: true, r: true }, true ],
  [ '((p & r) -> (q & r))', { p: false, q: false, r: true }, true ],
  [ '((p & r) <-> (q & r))', { p: true, q: true, r: true }, true ],
  [ '((p & r) <-> (q & r))', { p: true, q: false, r: true }, false ],
  [ '((p & r) <-> (q & r))', { p: false, q: true, r: true }, false ],
  [ '((p & r) <-> (q & r))', { p: false, q: false, r: true }, true ],

  [ '((p & r) & (q & r))', { p: true, q: true, r: false }, false ],
  [ '((p & r) & (q & r))', { p: true, q: false, r: false }, false ],
  [ '((p & r) & (q & r))', { p: false, q: true, r: false }, false ],
  [ '((p & r) & (q & r))', { p: false, q: false, r: false }, false ],
  [ '((p & r) | (q & r))', { p: true, q: true, r: false }, false ],
  [ '((p & r) | (q & r))', { p: true, q: false, r: false }, false ],
  [ '((p & r) | (q & r))', { p: false, q: true, r: false }, false ],
  [ '((p & r) | (q & r))', { p: false, q: false, r: false }, false ],
  [ '((p & r) -> (q & r))', { p: true, q: true, r: false }, true ],
  [ '((p & r) -> (q & r))', { p: true, q: false, r: false }, true ],
  [ '((p & r) -> (q & r))', { p: false, q: true, r: false }, true ],
  [ '((p & r) -> (q & r))', { p: false, q: false, r: false }, true ],
  [ '((p & r) <-> (q & r))', { p: true, q: true, r: false }, true ],
  [ '((p & r) <-> (q & r))', { p: true, q: false, r: false }, true ],
  [ '((p & r) <-> (q & r))', { p: false, q: true, r: false }, true ],
  [ '((p & r) <-> (q & r))', { p: false, q: false, r: false }, true ]
])('evaluate valid expression', (string, interpretation, result) => {
  expect(evaluateSentence(parse(string), interpretation)).toBe(result);
});
