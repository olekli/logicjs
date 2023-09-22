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
      '||6 (q & p) RE(4)',
    ]]
  ])('line in proof above is accessible', (proof) => {
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

});
