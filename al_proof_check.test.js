// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { ok, err, get_ok, get_err, useJestResultMatcher } = require('okljs');
const { parse } = require('./al_parse.js');
const { parseProof } = require('./al_proof_parse.js');
const { checkProof, CheckerErrors } = require('./al_proof_check.js');
const { reverseTranscribeOperators } = require('./transcribe.js');
const util = require('util');

useJestResultMatcher();

describe('correct proofs are correct', () => {

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +K(1,2)',
      '|4 (q & p) +K(2,1)',
      '||5 r A',
      '||-',
      '||6 (q & p) R(4)',
    ]],
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 p & q +K(1,2)',
      '|4 q & p +K(2,1)',
      '||5 r A',
      '||-',
      '||6 q & p R(4)',
    ]]
  ])('line in proof above is accessible', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeOk();
  })

  test.each([
    [[
      '|1 !p V',
      '|-',
      '||2 p A',
      '||-',
      '|||3 !q A',
      '|||-',
      '|||4 p R(2)',
      '|||5 !p R(1)',
      '||6 !!q RAA(3-5)',
      '||7 q -DN(6)',
      '|8 (p -> q) +I(2-7)'
    ]],
    [[
      '|1 !p V',
      '|-',
      '|2 !!!p +DN(1)',
      '||3 p A',
      '||-',
      '|||4 !q A',
      '|||-',
      '|||5 p R(3)',
      '|||6 !p R(1)',
      '||7 !!q RAA(4-6)',
      '||8 q -DN(7)',
      '|9 (p -> q) +I(3-8)'
    ]],
    [[
      '|1 !p V',
      '|-',
      '||2 p A',
      '||-',
      '|||3 !q A',
      '|||-',
      '|||4 p R(2)',
      '|||5 !p R(1)',
      '||6 !!q RAA(3-5)',
      '||7 q -DN(6)',
      '|8 p -> q +I(2-7)'
    ]],
  ])('meta arguments work correctly in proof', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeOk();
  });

  test.each([
    [[
      '|1 !p V',
      '|-',
      '||2 p A',
      '||-',
      '|||3 !q A',
      '|||-',
      '|||4 p R(2)',
      '|||5 !p R(1)',
      '||||6 r A',
      '||||-',
      '||||7 !q R(3)',
      '||8 !!q RAA(3-7)',
      '||9 q -DN(8)',
      '|10 (p -> q) +I(2-9)'
    ]]
  ])('RAA works correctly in proof pointlessly ending with subproof', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeOk();
  });

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +K(1,2)',
      '|4 (q & p) +K(2,1)',
    ]],
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 p & q +K(1,2)',
      '|4 q & p +K(2,1)',
    ]]
  ])('proof with allowed premises is correct', (proof) => {
    let result = checkProof(parseProof(proof), [ parse('p'), parse('q') ]);
    expect(result).toBeOk();
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +K(1,2)',
      '|4 (q & p) +K(2,1)',
    ]]
  ])('proof with expected conclusion is correct', (proof) => {
    let result = checkProof(parseProof(proof), [ parse('p'), parse('q') ], parse('(p&q)'));
    expect(result).toBeOk();
  })

  test.each([
    [[
      '|-',
      '||1 q A',
      '||-',
      '|||2 p A',
      '|||-',
      '|||3 (r|p) +A(2)',
      '||4 (p -> (r|p)) +I(2-3)',
      '|5 (q -> (p->(r|p))) +I(1-4)'
    ]],
    [[
      '|-',
      '||1 (p&!p) A',
      '||-',
      '|||2 !(q->r) A',
      '|||-',
      '|||3 p -K(1)',
      '|||4 !p -K(1)',
      '||5 !!(q->r) RAA(2-4)',
      '||6 (q->r) -DN(5)',
      '|7 ((p&!p) -> (q->r)) +I(1-6)'
    ]]
  ])('proof can start with subproof', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeOk();
  })

});

describe('incorrect proofs provide meaningful errors', () => {

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|4 (p & q) +K(1,2)',
      '|5 (q & p) +K(1,2)',
    ]]
  ])('skipping line number', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: CheckerErrors.InvalidNumbering,
      raw_line_number: 3
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|4 (p & q) +K(1,2)',
      '|3 (q & p) +K(1,2)',
    ]]
  ])('confused line number order', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: CheckerErrors.InvalidNumbering,
      raw_line_number: 3
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +K(1,2)',
      '|4 (q & p) +K(1,2)',
      '||5 r A',
      '||-',
      '||6 (q -> r) VEQ(5)',
      '|7 (p & (q -> r)) +K(1, 6)',
    ]]
  ])('inaccessible premise', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: CheckerErrors.InaccessiblePremise,
      raw_line_number: 8
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +K(1,2)',
      '|4 (q & p) +K(2,1)',
      '||5 r A',
      '||-',
      '||6 (q -> r) VEQ(4)',
    ]]
  ])('invalid argument application', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: CheckerErrors.InvalidArgumentApplication,
      raw_line_number: 7
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +K(1,2)',
      '|4 (q & p) +K(1,2)',
      '||5 r A',
      '||-',
      '||6 (q -> r) VEQ(4)',
    ]]
  ])('invalid premise', (proof) => {
    let result = checkProof(parseProof(proof), [ parse('q') ]);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: CheckerErrors.InvalidPremise,
      raw_line_number: 0
    });
  })

  test.each([
    [[
      '|1 !p V',
      '|-',
      '||2 p A',
      '||-',
      '|||3 !q A',
      '|||-',
      '|||4 p R(2)',
      '||||5 r A',
      '||||-',
      '||||6 !p R(1)',
      '||7 !!q RAA(3-6)',
      '||8 q -DN(7)',
      '|9 (p -> q) +I(2-8)'
    ]]
  ])('RAA cannot use nested subproof', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: CheckerErrors.InvalidArgumentApplication,
      raw_line_number: 10
    });
  });

  test.each([
    [[
      '|1 !p V',
      '|-',
      '|2 (!p & !!!p) +K(1, 3)',
      '|3 !!!p +DN(1)',
    ]]
  ])('object argument cannot use premise later in proof', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: CheckerErrors.InaccessiblePremise,
      raw_line_number: 2
    });
  });

  test.each([
    [[
      '|1 !p V',
      '|-',
      '|2 (p -> q) +I(3-8)',
      '||3 p A',
      '||-',
      '|||4 !q A',
      '|||-',
      '|||5 p R(3)',
      '|||6 !p R(1)',
      '||7 !!q RAA(4-6)',
      '||8 q -DN(7)',
      '|9 (p -> q) +I(3-8)'
    ]]
  ])('meta argument cannot use premise later in proof', (proof) => {
    let result = checkProof(parseProof(proof));
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: CheckerErrors.InaccessiblePremise,
      raw_line_number: 2
    });
  });

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (q & p) +K(2,1)',
    ]]
  ])('proof with missing expected conclusion is incorrect', (proof) => {
    let result = checkProof(parseProof(proof), [ parse('p'), parse('q') ], parse('(p&q)'));
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: CheckerErrors.MissingExpectedConclusion,
      raw_line_number: undefined
    });
  })

});

describe('extra cases', () => {

  test('case 1', () => {
    let proof =
`|-
|1 q → q T
||2 ¬q A
||-
|||3 r ∧ q A
|||-
|||4 q -K(3)
|||5 ¬q R(2)
||6 ¬(r∧q) RAA(3-5)
|7 ¬q → ¬(r∧q) +I(2-6)
|8 q ∨ ¬(r∧q) +A(1,7)
|9 p ∨ (q ∨ ¬(r∧q)) +A(8)`
    let result =
      checkProof(parseProof(proof.split('\n').map((s) => reverseTranscribeOperators(s))));
    expect(result).toBeOk();
  })

});
