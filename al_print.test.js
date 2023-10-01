// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { sentenceToString } = require('./al_print.js');
const { parse } = require('./al_parse.js');
const { reverseTranscribeOperators } = require('./transcribe.js');

test.each([
  [ 'p' ],
  [ 'q' ],
  [ '(p & q)' ],
  [ '!p' ],
  [ 'p & q' ],
  [ 'p | q' ],
  [ 'p -> q' ],
  [ 'p <-> q' ],
  [ '(p & p) & (q & q)' ],
  [ '(p & p) | (q & q)' ],
  [ '(p & p) -> (q & q)' ],
  [ '(p & p) <-> (q & q)' ],
  [ '(p & r) & (q & r)' ],
  [ '(p & r) | (q & r)' ],
  [ '(p & r) -> (q & r)' ],
  [ '(p & r) <-> (q & r)' ],
  [ '(p & q)' ],
  [ '(p | q)' ],
  [ '(p -> q)' ],
  [ '(p <-> q)' ],
  [ '((p & p) & (q & q))' ],
  [ '((p & p) | (q & q))' ],
  [ '((p & p) -> (q & q))' ],
  [ '((p & p) <-> (q & q))' ],
  [ '((p & r) & (q & r))' ],
  [ '((p & r) | (q & r))' ],
  [ '((p & r) -> (q & r))' ],
  [ '((p & r) <-> (q & r))' ]
])('sentence remains invariant after one pass', (input) => {
  let result = parse(reverseTranscribeOperators(sentenceToString(parse(input))));
  let expected = parse(input);
  expect(result).toEqual(expected);
});
