// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { Errors, parse } = require('./pl_parse.js');
const { ok, err, get_ok, get_err, useJestResultMatcher } = require('okljs');

useJestResultMatcher();

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
])('invalid expression is not a sentence', (string) => {
  expect(parse(string)).toBeErr();
});

test.each([
  [ 'AAxFx' ],
  [ 'AAx(Fx -> Gx)' ],
  [ 'AAxEEy(Fx -> Gy)' ],
  [ 'AAxEEy(Fx -> AAzGzy)' ],
  [ 'Fa & Gb' ],
  [ 'AAx (Fa & Gb)' ],
  [ 'AAx (Fx & Gb)' ],
  [ 'AAx (Fx & EEy(Fx -> Gxy))' ],
  [ 'AAx Fx & EExFx' ],
  [ 'AAx Fx & EEyFy' ],
])('valid expression is a sentence', (string) => {
  expect(parse(string)).toBeOk();
});

test.each([
  [ 'AAy (Fx & Gb)' ],
  [ 'AAx (Fy & Gx)' ],
  [ 'AAx (Fx & EEy(Fx -> Gzy))' ],
  [ 'AAx Fx & EEyFx' ],
])('unbound variable makes no sentence', (string) => {
  let result = parse(string);
  expect(result).toBeErr();
  expect(get_err(result)).toEqual(Errors.UnboundVariable);
});
