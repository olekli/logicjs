// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { ok, err, get_ok, get_err, useJestResultMatcher } = require('okljs');
const { parse } = require('./al_parse.js');
const { ExerciseAlProofs } = require('./exercise_al_proofs.js');

useJestResultMatcher();

describe('ExerciseAlProofs', () => {

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
  ])('In sandbox mode, any correct proof is correct', (proof) => {
    let exercise = new ExerciseAlProofs('sandbox', {});
    expect(exercise.checkAnswer(proof)).toBeOk();
  });

  test.each([
    [
      [
        '|1 p V',
        '|2 q V',
        '|-',
        '|3 (p & q) +K(1,2)',
        '|4 (q & p) +K(2,1)',
        '||5 r A',
        '||-',
        '||6 (q & p) R(4)',
      ],
      [ 'p', 'q' ],
      '(q & p)'
    ]
  ])('In generator mode, correct proof matching requested one is correct', (proof, premises_, conclusion_) => {
    let premises = premises_.map((p) => parse(p));
    let conclusion = parse(conclusion_);
    let exercise =
      new ExerciseAlProofs(
        'mode1',
        {
          al_proofs: {
            mode1: {
              generate: () => ({ premises: premises, conclusion: conclusion })
            }
          }
        });
    expect(exercise.checkAnswer(proof)).toBeOk();
  });

  test.each([
    [
      [
        '|1 p V',
        '|2 q V',
        '|-',
        '|3 (p & q) +K(1,2)',
        '|4 (q & p) +K(2,1)',
      ],
      [ 'p' ],
      '(q & p)'
    ]
  ])('In generator mode, an invalid premise is rejected', (proof, premises_, conclusion_) => {
    let premises = premises_.map((p) => parse(p));
    let conclusion = parse(conclusion_);
    let exercise =
      new ExerciseAlProofs(
        'mode1',
        {
          al_proofs: {
            mode1: {
              generate: () => ({ premises: premises, conclusion: conclusion })
            }
          }
        });
    expect(exercise.checkAnswer(proof)).toBeErr();
  });

  test.each([
    [
      [
        '|1 p V',
        '|2 q V',
        '|-',
        '|3 (p & q) +K(1,2)',
      ],
      [ 'p', 'q' ],
      '(q & p)'
    ]
  ])('In generator mode, a missing conclusion is rejected', (proof, premises_, conclusion_) => {
    let premises = premises_.map((p) => parse(p));
    let conclusion = parse(conclusion_);
    let exercise =
      new ExerciseAlProofs(
        'mode1',
        {
          al_proofs: {
            mode1: {
              generate: () => ({ premises: premises, conclusion: conclusion })
            }
          }
        });
    expect(exercise.checkAnswer(proof)).toBeErr();
  });

});
