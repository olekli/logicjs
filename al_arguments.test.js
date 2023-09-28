// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { ok, err, get_ok, get_err, useJestResultMatcher } = require('okljs');
const { matchSentence, matchObjectArgument, matchMetaArgument, checkArgument } = require('./al_arguments.js');
const { parse } = require('./al_parse.js');

useJestResultMatcher();

describe('matchSentence', () => {
  test.each([
    [ '( A -> B )', '(p -> p)' ],
    [ '( A -> B )', '(p -> q)' ],
    [ '( A -> B )', '((p | r) -> q)' ],
    [ '( A -> A )', '(q -> q)' ],
    [ '( A | B )', '(p | (q | p))' ],
    [ '( A & B )', '(p & (q | p))' ],
    [ '( A & B )', '(!p & (q | p))' ],
    [ '( A & B )', '(!p & !(q | p))' ],
    [ '!( A & B )', '!(!p & !(q | p))' ],
    [ '!A', '!p' ],
    [ '!A', '!(p -> q)' ],
    [ '!!A', '!!p' ],
    [ '!!A', '!!(p -> q)' ],
    [ '!A', '!!p' ],
    [ '!A', '!!(p -> q)' ]
  ])('matching pattern matches correctly', (pattern, sentence) => {
    let result = matchSentence(parse(pattern), parse(sentence));
    expect(result).toBeOk();
  });

  test.each([
    [ '( A -> A )', '(p -> q)' ],
    [ '( A | A )', '(p | (p -> p))' ],
    [ '( A <-> A )', '(p <-> (p <-> p))' ],
    [ '( A -> B )', '(p & q)' ],
    [ '( A & B )', '(p | (q & p))' ],
    [ '( A & B )', '(p | (q & p))' ],
    [ '!( A & B )', '(!p & !(q | p))' ],
    [ '(A -> A)', '(p -> !p)' ]
  ])('non-matching pattern does not match', (pattern, sentence) => {
    let result = matchSentence(parse(pattern), parse(sentence));
    expect(result).toBeErr();
  });

  test.each([
    [ '( A -> B )', '(p -> p)', { A: parse('p'), B: parse('p') } ],
    [ '( A -> B )', '(p -> q)', { A: parse('p'), B: parse('q') } ],
    [ '( A -> B )', '((p | r) -> q)', { A: parse('(p | r)'), B: parse('q') } ],
    [ '( A -> A )', '(q -> q)', { A: parse('q') } ],
    [ '( A | B )', '(p | (q | p))', { A: parse('p'), B: parse('(q | p)') } ],
    [ '( A & B )', '(p & (q | p))', { A: parse('p'), B: parse('(q | p)') } ],
    [ '( A & B )', '(!p & (q | p))', { A: parse('!p'), B: parse('(q | p)') } ],
    [ '( A & B )', '(!p & !(q | p))', { A: parse('!p'), B: parse('!(q | p)') } ],
    [ '!( A & B )', '!(!p & !(q | p))', { A: parse('!p'), B: parse('!(q | p)') } ],
    [ '!A', '!p', { A: parse('p') } ],
    [ '!A', '!(p -> q)', { A: parse('(p->q)') } ],
    [ '!!A', '!!p', { A: parse('p') } ],
    [ '!!A', '!!(p -> q)', { A: parse('(p->q)') } ],
    [ '!A', '!!p', { A: parse('!p') } ],
    [ '!A', '!!(p -> q)', { A: parse('!(p->q)') } ],
    [ 'A', '!p', { A: parse('!p') } ],
    [ '(A -> B)', '(p -> !q)', { A: parse('p'), B: parse('!q') } ],
  ])('produces correct mapping', (pattern, sentence, mapping) => {
    let result = matchSentence(parse(pattern), parse(sentence));
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(mapping);
  });
});

describe('matchObjectArgument', () => {
  test.each([
    [ ['A', 'B'], '(A & B)', [ 'p', 'q' ], '( p & q )' ],
    [ ['A', 'B'], '(A & B)', [ 'p', 'p' ], '( p & p )' ],
    [ ['(A->B)', '(!A->C)'], '(B | C)', [ '(p -> q)', '(!p -> (r & p))' ], '( q | (r&p))' ],
    [ ['!!A'], 'A', [ '!!(p -> q)' ], '(p -> q)'],
    [ ['A'], '!!A', [ '(p -> q)' ], '!!(p -> q)'],
    [ ['(A->B)', '(A->!B)'], '!A', [ '((p -> r) -> (q -> p))', '((p -> r) -> !(q -> p))' ], '!(p->r)' ],
    [ ['A', 'B'], '(A & B)', [ '(p -> r)', '!q' ], '(( p -> r) & !q)' ],
    [ [], '(A -> A)', [], '(p -> p)' ],
  ])('matching argument matches correctly', (premises_patterns_, conclusion_pattern_, premises_, conclusion_) => {
    let premises_patterns = premises_patterns_.map((s) => parse(s));
    let conclusion_pattern = parse(conclusion_pattern_);
    let premises = premises_.map((s) => parse(s));
    let conclusion = parse(conclusion_);

    let result = matchObjectArgument(premises_patterns, conclusion_pattern, premises, conclusion);
    expect(result).toBeOk();
  });

  test.each([
    [ ['A', 'B'], '(A & B)', [ 'p', 'q' ], '( p & p )' ],
    [ ['A', 'B'], '(A & B)', [ 'p', 'q' ], '( q & p )' ],
    [ ['A', 'B'], '(A & B)', [ 'p', 'q' ], '( p | q )' ],
    [ ['(A->B)', '(!A->C)'], '(B | C)', [ '(p -> q)', '(!q -> (r & p))' ], '( q | (r&p))' ],
    [ ['A', 'B'], '(A & B)', [ 'p', '!q' ], '(p & q)' ],
    [ ['A', 'B'], '(A & B)', [ 'p', 'q' ], '(p & !q)' ],
    [ ['A', 'B'], '(A & B)', [ '(p -> r)', '!q' ], '(( p -> r) & q)' ]
  ])('non-matching argument does not match', (premises_patterns_, conclusion_pattern_, premises_, conclusion_) => {
    let premises_patterns = premises_patterns_.map((s) => parse(s));
    let conclusion_pattern = parse(conclusion_pattern_);
    let premises = premises_.map((s) => parse(s));
    let conclusion = parse(conclusion_);

    let result = matchObjectArgument(premises_patterns, conclusion_pattern, premises, conclusion);
    expect(result).toBeErr();
  });
});

describe('matchMetaArgument', () => {
  test.each([
    [ [ '(A -> B)' ], '(A -> B)', [ 'p', 'q' ], '(p -> q)' ],
    [ [ '(A -> B)' ], '(A -> B)', [ 'p', 'r', 'q' ], '(p -> q)' ],
    [ [ '(A -> B)' ], '(A -> B)', [ 'p', 'r', 'q' ], '(p -> r)' ],
    [ [ '(A -> B)' ], '(A -> B)', [ 'p', '(p & q)', 'q' ], '(p -> q)' ],
    [ [ '(A -> B)', '(A -> !B)' ], '!A', [ 'p', 'q', '!q' ], '!p' ],
    [ [ '(A -> B)', '(A -> !B)' ], '!A', [ 'p', '!q', '(p & !q)', 'q' ], '!p' ],
  ])('matching argument matches correctly', (inferences_, conclusion_pattern_, proof_, conclusion_) => {
    let inferences = inferences_.map((s) => parse(s));
    let conclusion_pattern = parse(conclusion_pattern_);
    let proof = proof_.map((s) => parse(s));
    let conclusion = parse(conclusion_);

    let result = matchMetaArgument(inferences, conclusion_pattern, proof, conclusion);
    expect(result).toBeOk();
  });

  test.each([
    [ [ '(A -> B)' ], '(A -> B)', [ 'p', 'r' ], '(p -> q)' ],
    [ [ '(A -> B)' ], '(A -> B)', [ 'p', '(p & q)', 'r' ], '(p -> q)' ],
    [ [ '(A -> B)', '(A -> !B)' ], '!A', [ 'p', 'q', '!q' ], '!q' ],
    [ [ '(A -> B)', '(A -> !B)' ], '!A', [ 'p', 'q', '!q' ], 'q' ],
    [ [ '(A -> B)', '(A -> !B)' ], '!A', [ 'p', 'q', '!q' ], 'p' ],
    [ [ '(A -> B)', '(A -> !B)' ], '!A', [ 'p', '(p & q)', '!q' ], '!p' ],
    [ [ '(A -> B)', '(A -> !B)' ], '!A', [ 'p', '(p & !q)', 'q' ], '!p' ],
  ])('non-matching argument does not match', (inferences_, conclusion_pattern_, proof_, conclusion_) => {
    let inferences = inferences_.map((s) => parse(s));
    let conclusion_pattern = parse(conclusion_pattern_);
    let proof = proof_.map((s) => parse(s));
    let conclusion = parse(conclusion_);

    let result = matchMetaArgument(inferences, conclusion_pattern, proof, conclusion);
    expect(result).toBeErr();
  });
});

describe('checkArgument', () => {
  describe('+K', () => {
    test.each([
      [ [ 'p', 'q' ], '(p & q)' ],
      [ [ '(p -> r)', '!q' ], '(( p -> r) & !q)' ]
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+K', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ 'p', 'q' ], '(p | q)' ],
      [ [ '(p -> r)', '!q' ], '(( p -> r) & q)' ],
      [ [ 'p' ], '(p & p)' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+K', premises, conclusion)).toBeErr();
    });
  });

  describe('-K', () => {
    test.each([
      [ [ '(p & q)' ], 'p' ],
      [ [ '(p & q)' ], 'q' ],
      [ [ '((p -> r) & !q)' ], '(p->r)' ],
      [ [ '((p -> r) & !q)' ], '!q' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-K', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ '(p & q)' ], 'r' ],
      [ [ '(p & q)' ], '!p' ],
      [ [ '(p & q)' ], '!q' ],
      [ [ '((p -> r) & !q)' ], '!(p->r)' ],
      [ [ '((p -> r) & !q)' ], 'q' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-K', premises, conclusion)).toBeErr();
    });
  });

  describe('+A', () => {
    test.each([
      [ [ '(p -> q)', '(!p -> r)' ], '(q | r)' ],
      [ [ '(p -> q)', '(!p -> r)' ], '(r | q)' ],
      [ [ 'p' ], '( p | q)' ],
      [ [ 'q' ], '( p | q)' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+A', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ '(p -> q)', '(!p -> r)' ], '(!q | r)' ],
      [ [ '(p -> q)', '(!p -> r)' ], '(q | !r)' ],
      [ [ '(p -> q)', '(!p -> r)' ], '(!r | q)' ],
      [ [ '(p -> q)', '(!p -> r)' ], '(r | !q)' ],
      [ [ 'p' ], '( !p | q)' ],
      [ [ 'q' ], '( p | !q)' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+A', premises, conclusion)).toBeErr();
    });
  });

  describe('-A', () => {
    test.each([
      [ [ '(p | q)', '(p -> r)', '(q -> r)' ], 'r' ],
      [ [ '(p | !q)', '(p -> r)', '(!q -> r)' ], 'r' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-A', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ '(p | q)', '(p -> r)', '(q -> r)' ], '!r' ],
      [ [ '(p | q)', '(p -> r)', '(!q -> r)' ], 'r' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-A', premises, conclusion)).toBeErr();
    });
  });

  describe('+I', () => {
    test.each([
      [ [ 'p', 'r', 'q' ], '(p -> q)' ],
      [ [ '(p | q)', '(p -> r)', '(q -> r)' ], '((p | q) -> (p -> r))' ],
      [ [ '(p | q)', '(p -> r)', '(q -> r)' ], '((p | q) -> (q -> r))' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+I', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ 'p', 'r', 'q' ], '(r -> q)' ],
      [ [ '(p | q)', '(p -> r)', '(q -> r)' ], '((p | q) -> (r -> p))' ],
      [ [ '(p | q)', '(p -> r)', '(q -> r)' ], '(!(p | q) -> (r -> p))' ],
      [ [ '(p | q)', '(p -> r)', '(q -> r)' ], '((p | q) -> (!r -> p))' ],
      [ [ '(p | q)', '(p -> r)', '(q -> r)' ], '((p | q) -> !(r -> p))' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+I', premises, conclusion)).toBeErr();
    });
  });

  describe('-I', () => {
    test.each([
      [ [ '(p -> q)', 'p' ], 'q' ],
      [ [ '(p -> !q)', 'p' ], '!q' ],
      [ [ '(!p -> q)', '!p' ], 'q' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-I', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ '(p -> q)', 'q' ], 'p' ],
      [ [ '(p -> !q)', 'p' ], 'q' ],
      [ [ '(!p -> q)', 'p' ], 'q' ],
      [ [ '(p -> q)', 'p' ], '!q' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-I', premises, conclusion)).toBeErr();
    });
  });

  describe('+Ä', () => {
    test.each([
      [ [ '(p -> q)', '(q -> p)' ], '(p <-> q)' ],
      [ [ '(p -> q)', '(q -> p)' ], '(q <-> p)' ],
      [ [ '(p -> !q)', '(!q -> p)' ], '(p <-> !q)' ],
      [ [ '(p -> !q)', '(!q -> p)' ], '(!q <-> p)' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+Ä', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ '(p -> q)', '(q -> p)' ], '(!p <-> q)' ],
      [ [ '(p -> q)', '(q -> p)' ], '(p <-> !q)' ],
      [ [ '(p -> q)', '(q -> p)' ], '(p <-> p)' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+Ä', premises, conclusion)).toBeErr();
    });
  });

  describe('-Ä', () => {
    test.each([
      [ [ '(p <-> q)' ], '(p -> q)' ],
      [ [ '(p <-> q)' ], '(q -> p)' ],
      [ [ '(!p <-> q)' ], '(!p -> q)' ],
      [ [ '(!p <-> q)' ], '(q -> !p)' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-Ä', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ '(p <-> q)' ], '(!p -> q)' ],
      [ [ '(p <-> q)' ], '(!q -> p)' ],
      [ [ '(!p <-> q)' ], '(p -> q)' ],
      [ [ '(!p <-> q)' ], '(q -> p)' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-Ä', premises, conclusion)).toBeErr();
    });
  });

  describe('RAA', () => {
    test.each([
      [ [ 'p', 'q', '!q' ], '!p' ],
      [ [ 'p', 'q', 'r', '!q' ], '!p' ],
      [ [ '!p', 'q', 'r', '!q' ], '!!p' ],
      [ [ '!p', '!!q', 'r', '!q' ], '!!p' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('RAA', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ 'p', 'q', '!q' ], 'p' ],
      [ [ 'p', 'q', '!q' ], 'q' ],
      [ [ 'p', 'q', '!q' ], '!q' ],
      [ [ 'p', 'q', 'r', '!q' ], 'r' ],
      [ [ '!p', 'q', 'r', '!q' ], 'p' ],
      [ [ '!p', '!!q', 'r', '!q' ], '!p' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('RAA', premises, conclusion)).toBeErr();
    });
  });

  describe('+DN', () => {
    test.each([
      [ [ 'p' ], '!!p' ],
      [ [ '!p' ], '!!!p' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+DN', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ 'p' ], '!p' ],
      [ [ '!p' ], '!!p' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('+DN', premises, conclusion)).toBeErr();
    });
  });

  describe('-DN', () => {
    test.each([
      [ [ '!!p' ], 'p' ],
      [ [ '!!!p' ], '!p' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-DN', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ '!!!p' ], 'p' ],
      [ [ '(!!p -> p)' ], '(p -> p)' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('-DN', premises, conclusion)).toBeErr();
    });
  });

  describe('T', () => {
    test.each([
      [ [], '(p -> p)' ],
      [ [], '( (p -> q) -> (p -> q) )' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('T', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [], '(p -> q)' ],
      [ [], 'p' ],
      [ [], '(p -> !p)' ],
      [ [], '( (p -> p) -> (p -> q) )' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('T', premises, conclusion)).toBeErr();
    });
  });

  describe('EFQ', () => {
    test.each([
      [ [ '!p' ], '(p -> q)' ],
      [ [ '!p' ], '(p -> p)' ],
      [ [ '!p' ], '(p -> !p)' ],
      [ [ '!!p' ], '(!p -> q)' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('EFQ', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ 'p' ], '(p -> q)' ],
      [ [ '!p' ], '(q -> !p)' ],
      [ [ 'p' ], '(!p -> q)' ],
      [ [ '!p' ], '(!p -> q)' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('EFQ', premises, conclusion)).toBeErr();
    });
  });

  describe('VEQ', () => {
    test.each([
      [ [ '!p' ], '(p -> !p)' ],
      [ [ '!p' ], '(q -> !p)' ],
      [ [ 'p' ], '(q -> p)' ],
      [ [ '!!p' ], '(!q -> !!p)' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('VEQ', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ 'p' ], '(p -> q)' ],
      [ [ '!p' ], '(q -> p)' ],
      [ [ 'p' ], '(!p -> q)' ],
      [ [ '!p' ], '(!p -> q)' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('VEQ', premises, conclusion)).toBeErr();
    });
  });

  describe('R', () => {
    test.each([
      [ [ '!p' ], '!p' ],
      [ [ '(p -> q)' ], '(p -> q)' ],
      [ [ 'p' ], 'p' ],
      [ [ '!!p' ], '!!p' ],
      [ [ '(p & q)' ], '(p & q)' ],
      [ [ '(p | q)' ], '(p | q)' ],
      [ [ '(p <-> q)' ], '(p <-> q)' ],
      [ [ '(p & q)' ], '(q & p)' ],
      [ [ '(p | q)' ], '(q | p)' ],
      [ [ '(p <-> q)' ], '(q <-> p)' ],
    ])('correct usage is correct', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('R', premises, conclusion)).toBeOk();
    });

    test.each([
      [ [ 'p' ], '(p -> q)' ],
      [ [ '!p' ], '(q -> p)' ],
      [ [ 'p' ], 'q' ],
      [ [ '(p -> q)' ], '(q -> p)' ],
      [ [ 'p' ], '!p' ],
      [ [ '!p' ], 'p' ],
    ])('incorrect usage is incorrect', (premises_, conclusion_) => {
      let premises = premises_.map((s) => parse(s));
      let conclusion = parse(conclusion_);
      expect(checkArgument('R', premises, conclusion)).toBeErr();
    });
  });
});
