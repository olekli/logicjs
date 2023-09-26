'use strict'

const { PremiseGenerator } = require('./al_premise_generator.js');
const { enumerateInterpretations } = require('./al_models.js');
const { evaluateSentence } = require('./al_eval.js');
const { sentenceToString } = require('./al_print.js');

describe('PremiseGenerator', () => {

  test.each([
    [ [ 'p', 'q' ], 2 ],
    [ [ 'p', 'q' ], 3 ],
    [ [ 'p', 'q' ], 4 ],
    [ [ 'p', 'q', 'r' ], 3 ],
    [ [ 'p', 'q', 'r' ], 4 ],
  ])('generates correct premise/conclusion', (letters, length) => {
    let generator = new PremiseGenerator(letters, length);
    for (let i = 0; i < 100; i++) {
      let result = generator.generate();
      let interpretations = enumerateInterpretations(letters);
      let non_contradictory = false;
      for (let interpretation of interpretations) {
        let v = true;
        for (let premise of result.premises) {
          v = v && evaluateSentence(premise, interpretation);
        }
        if (v) {
          expect(evaluateSentence(result.conclusion, interpretation)).toBe(true);
          non_contradictory = true;
        }
      }
      // console.log(`RESULT: ${result.premises.map((p) => sentenceToString(p))} => ${sentenceToString(result.conclusion)}, ${non_contradictory}`);
    }
  });

});
