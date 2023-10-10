// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { ok, err, get_ok, get_err, useJestResultMatcher } = require('okljs');
const { parseProof, ParserErrors } = require('./al_proof_parse.js');
const { reverseTranscribeOperators } = require('./transcribe.js');
const util = require('util');

useJestResultMatcher();

describe('correct proofs are parsed correctly', () => {

  test.each([
    [[
      '|-',
      '|1 (p -> p) T',
      '|2 (q -> (p -> p)) VEQ(1)',
    ]],
    [[
      '|-',
      '|1 p -> p T',
      '|2 q -> (p -> p) VEQ(1)',
    ]]
  ])('without premises', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(
      [
        {
          type: 'sentence',
          depth: 1,
          line_number: 0,
          raw_line_number: 1,
          sentence: {
            operator: 'follows',
            lhs: { letter: 'p' },
            rhs: { letter: 'p' }
          },
          argument: { name: 'T', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 1,
          raw_line_number: 2,
          sentence: {
            operator: 'follows',
            lhs: { letter: 'q' },
            rhs: {
              operator: 'follows',
              lhs: { letter: 'p' },
              rhs: { letter: 'p' }
            }
          },
          argument: { name: 'VEQ', type: 'object', premises_lines: [ 0 ] }
        }
      ]
    );
  });

  test.each([
    [[
      '|1 r V',
      '|-',
      '|2 (p -> p) T',
      '|3 (q -> (p -> p)) VEQ(2)',
    ]],
    [[
      '|1 r V',
      '|-',
      '|2 p -> p T',
      '|3 q -> (p -> p) VEQ(2)',
    ]]
  ])('with single premise', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(
      [
        {
          type: 'sentence',
          depth: 1,
          line_number: 0,
          raw_line_number: 0,
          sentence: { letter: 'r' },
          argument: { name: 'V', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 1,
          raw_line_number: 2,
          sentence: {
            operator: 'follows',
            lhs: { letter: 'p' },
            rhs: { letter: 'p' }
          },
          argument: { name: 'T', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 2,
          raw_line_number: 3,
          sentence: {
            operator: 'follows',
            lhs: { letter: 'q' },
            rhs: {
              operator: 'follows',
              lhs: { letter: 'p' },
              rhs: { letter: 'p' }
            }
          },
          argument: { name: 'VEQ', type: 'object', premises_lines: [ 1 ] }
        }
      ]
    );
  });

  test.each([
    [[
      '|1 r V',
      '|2 s V',
      '|3 (s -> r) V',
      '|-',
      '|4 (p -> p) T',
      '|5 (q -> (p -> p)) VEQ(3)',
    ]],
    [[
      '|1 r V',
      '|2 s V',
      '|3 s -> r V',
      '|-',
      '|4 p -> p T',
      '|5 q -> (p -> p) VEQ(3)',
    ]]
  ])('with multiple premises', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(
      [
        {
          type: 'sentence',
          depth: 1,
          line_number: 0,
          raw_line_number: 0,
          sentence: { letter: 'r' },
          argument: { name: 'V', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 1,
          raw_line_number: 1,
          sentence: { letter: 's' },
          argument: { name: 'V', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 2,
          raw_line_number: 2,
          sentence: {
            operator: 'follows',
            lhs: { letter: 's' },
            rhs: { letter: 'r' }
          },
          argument: { name: 'V', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 3,
          raw_line_number: 4,
          sentence: {
            operator: 'follows',
            lhs: { letter: 'p' },
            rhs: { letter: 'p' }
          },
          argument: { name: 'T', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 4,
          raw_line_number: 5,
          sentence: {
            operator: 'follows',
            lhs: { letter: 'q' },
            rhs: {
              operator: 'follows',
              lhs: { letter: 'p' },
              rhs: { letter: 'p' }
            }
          },
          argument: { name: 'VEQ', type: 'object', premises_lines: [ 2 ] }
        }
      ]
    );
  });

  test.each([
    [[
      '|1 (p | q) V',
      '|-',
      '|2 (p -> p) T',
      '|3 (q -> (p -> p)) VEQ(2)',
      '|4 (p -> (p -> p)) VEQ(2)',
      '|5 (p -> p) -A(1, 4, 3)'
    ]],
    [[
      '|1 p | q V',
      '|-',
      '|2 p -> p T',
      '|3 q -> (p -> p) VEQ(2)',
      '|4 p -> (p -> p) VEQ(2)',
      '|5 p -> p -A(1, 4, 3)'
    ]]
  ])('arguments with multiple premises', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(
      [
        {
          type: 'sentence',
          depth: 1,
          line_number: 0,
          raw_line_number: 0,
          sentence: { operator: 'or', lhs: { letter: 'p' }, rhs: { letter: 'q' } },
          argument: { name: 'V', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 1,
          raw_line_number: 2,
          sentence: { operator: 'follows', lhs: { letter: 'p' }, rhs: { letter: 'p' } },
          argument: { name: 'T', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 2,
          raw_line_number: 3,
          sentence: {
            operator: 'follows',
            lhs: { letter: 'q' },
            rhs: {
              operator: 'follows',
              lhs: { letter: 'p' },
              rhs: { letter: 'p' }
            }
          },
          argument: { name: 'VEQ', type: 'object', premises_lines: [ 1 ] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 3,
          raw_line_number: 4,
          sentence: {
            operator: 'follows',
            lhs: { letter: 'p' },
            rhs: {
              operator: 'follows',
              lhs: { letter: 'p' },
              rhs: { letter: 'p' }
            }
          },
          argument: { name: 'VEQ', type: 'object', premises_lines: [ 1 ] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 4,
          raw_line_number: 5,
          sentence: { operator: 'follows', lhs: { letter: 'p' }, rhs: { letter: 'p' } },
          argument: { name: '-A', type: 'object', premises_lines: [ 0, 3, 2 ] }
        }
      ]
    );
    // console.log(util.inspect(get_ok(result), { depth: null }));
  });

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 ( p & q ) +K(1,2)',
      '|| 4 r A',
      '||-',
      '|| 5 q R(2)',
      '|6 (r->q) +I(4-5)',
      '|7 ( p & q ) +K(1,2)',
      '|| 8 r A',
      '||-',
      '||| 9 s A',
      '|||-',
      '||| 10 (p & q) R(3)',
      '|||| 11 t A',
      '||||-',
      '|||| 12 s R(9)',
      '|||13 (t->s) +I(11-12)',
      '||14 (s -> (t -> s)) +I(9-13)',
      '|15 (r -> (s -> (t -> s))) +I(8-14)',
    ]],
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3  p & q +K(1,2)',
      '|| 4 r A',
      '||-',
      '|| 5 q R(2)',
      '|6 r->q +I(4-5)',
      '|7 ( p & q ) +K(1,2)',
      '|| 8 r A',
      '||-',
      '||| 9 s A',
      '|||-',
      '||| 10 p & q R(3)',
      '|||| 11 t A',
      '||||-',
      '|||| 12 s R(9)',
      '|||13 t->s +I(11-12)',
      '||14 s -> (t -> s) +I(9-13)',
      '|15 r -> (s -> (t -> s)) +I(8-14)',
    ]]
  ])('multiple subproofs', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(
      [
        {
          type: 'sentence',
          depth: 1,
          line_number: 0,
          raw_line_number: 0,
          sentence: { letter: 'p' },
          argument: { name: 'V', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 1,
          raw_line_number: 1,
          sentence: { letter: 'q' },
          argument: { name: 'V', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 2,
          raw_line_number: 3,
          sentence: { operator: 'and', lhs: { letter: 'p' }, rhs: { letter: 'q' } },
          argument: { name: '+K', type: 'object', premises_lines: [ 0, 1 ] }
        },
        {
          type: 'sentence',
          depth: 2,
          line_number: 3,
          raw_line_number: 4,
          sentence: { letter: 'r' },
          argument: { name: 'A', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 2,
          line_number: 4,
          raw_line_number: 6,
          sentence: { letter: 'q' },
          argument: { name: 'R', type: 'object', premises_lines: [ 1 ] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 5,
          raw_line_number: 7,
          sentence: { operator: 'follows', lhs: { letter: 'r' }, rhs: { letter: 'q' } },
          argument: { name: '+I', type: 'meta', premises_lines: [ 3, 4 ] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 6,
          raw_line_number: 8,
          sentence: { operator: 'and', lhs: { letter: 'p' }, rhs: { letter: 'q' } },
          argument: { name: '+K', type: 'object', premises_lines: [ 0, 1 ] }
        },
        {
          type: 'sentence',
          depth: 2,
          line_number: 7,
          raw_line_number: 9,
          sentence: { letter: 'r' },
          argument: { name: 'A', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 3,
          line_number: 8,
          raw_line_number: 11,
          sentence: { letter: 's' },
          argument: { name: 'A', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 3,
          line_number: 9,
          raw_line_number: 13,
          sentence: { operator: 'and', lhs: { letter: 'p' }, rhs: { letter: 'q' } },
          argument: { name: 'R', type: 'object', premises_lines: [ 2 ] }
        },
        {
          type: 'sentence',
          depth: 4,
          line_number: 10,
          raw_line_number: 14,
          sentence: { letter: 't' },
          argument: { name: 'A', type: 'object', premises_lines: [] }
        },
        {
          type: 'sentence',
          depth: 4,
          line_number: 11,
          raw_line_number: 16,
          sentence: { letter: 's' },
          argument: { name: 'R', type: 'object', premises_lines: [ 8 ] }
        },
        {
          type: 'sentence',
          depth: 3,
          line_number: 12,
          raw_line_number: 17,
          sentence: { operator: 'follows', lhs: { letter: 't' }, rhs: { letter: 's' } },
          argument: { name: '+I', type: 'meta', premises_lines: [ 10, 11 ] }
        },
        {
          type: 'sentence',
          depth: 2,
          line_number: 13,
          raw_line_number: 18,
          sentence: {
            operator: 'follows',
            lhs: { letter: 's' },
            rhs: {
              operator: 'follows',
              lhs: { letter: 't' },
              rhs: { letter: 's' }
            }
          },
          argument: { name: '+I', type: 'meta', premises_lines: [ 8, 12 ] }
        },
        {
          type: 'sentence',
          depth: 1,
          line_number: 14,
          raw_line_number: 19,
          sentence: {
            operator: 'follows',
            lhs: { letter: 'r' },
            rhs: {
              operator: 'follows',
              lhs: { letter: 's' },
              rhs: {
                operator: 'follows',
                lhs: { letter: 't' },
                rhs: { letter: 's' }
              }
            }
          },
          argument: { name: '+I', type: 'meta', premises_lines: [ 7, 13 ] }
        }
      ]
    );
    //console.log(util.inspect(get_ok(result), { depth: null }));
  });

});

describe('incorrect proofs provide meaningful errors', () => {

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|3 (p & q) +K(1,2)'
    ]],
    [[
      '|1 p V',
      '|2 q V',
      '|3 p & q +K(1,2)'
    ]]
  ])('missing separator after premises', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.ExpectedSeparatorOrPremise,
      raw_line_number: 2
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
    ]]
  ])('unexpected end after premises', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.ExpectedSeparatorOrPremise,
      raw_line_number: 2
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +K(1,2)',
      '|| 4 r A',
      '|| 5 (s -> r) VEQ(4)',
      '|6 (r -> (s -> r)) +I(3-5)'
    ]],
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 p & q +K(1,2)',
      '|| 4 r A',
      '|| 5 s -> r VEQ(4)',
      '|6 r -> (s -> r) +I(3-5)'
    ]]
  ])('missing separator after assumption', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.ExpectedSeparator,
      raw_line_number: 5
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +K(1,2)',
      '|| 4 r A',
    ]]
  ])('unexpected end after assumption', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.ExpectedSeparator,
      raw_line_number: 5
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +X(1,2)',
      '|4 (q & p) +K(1,2)',
    ]]
  ])('unknown argument', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.InvalidArgumentName,
      raw_line_number: 3
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) V',
      '|4 (q & p) +K(1,2)',
    ]]
  ])('misplaced premise', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.InvalidArgumentName,
      raw_line_number: 3
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) A',
      '|4 (q & p) +K(1,2)',
    ]]
  ])('misplaced assumption', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.InvalidArgumentName,
      raw_line_number: 3
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q +K(1,2)',
      '|4 (q & p) +K(1,2)',
    ]]
  ])('invalid sentence', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.ParserError,
      raw_line_number: 3
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '|3 (p & q) +I(1-2-3)',
      '|4 (q & p) +K(1,2)',
    ]]
  ])('invalid meta argument', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.ParserError,
      raw_line_number: 3
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '| (p & q) +K(1,2)',
      '|4 (q & p) +K(1,2)',
    ]]
  ])('missing number', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.ParserError,
      raw_line_number: 3
    });
  })

  test.each([
    [[
      '|1 p V',
      '|2 q V',
      '|-',
      '3 (p & q) +K(1,2)',
      '|4 (q & p) +K(1,2)',
    ]]
  ])('missing bar', (proof) => {
    let result = parseProof(proof);
    expect(result).toBeErr();
    expect(get_err(result)).toMatchObject({
      type: ParserErrors.ParserError,
      raw_line_number: 3
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
    let result = parseProof(proof.split('\n').map((s) => reverseTranscribeOperators(s)));
    expect(result).toBeOk();
  })

});
