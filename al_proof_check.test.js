'use strict'

const { ok, err, get_ok, get_err, useJestResultMatcher } = require('okljs');
const { parse } = require('./al_parse.js');
const { parseProof } = require('./al_proof_parse.js');
const { checkProof, CheckerErrors } = require('./al_proof_check.js');
const util = require('util');

useJestResultMatcher();

describe('correct proofs are correct', () => {

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +K(1,2)',
      '|4 (q & p) +K(1,2)',
      '||5 r A',
      '||-',
      '||6 (q & p) R(4)',
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
    ]]
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
      '|4 (q & p) +K(1,2)',
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

});
