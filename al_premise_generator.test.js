'use strict'

const { PremiseGenerator } = require('./al_premise_generator.js');
const { enumerateInterpretations } = require('./al_models.js');
const { evaluateSentence } = require('./al_eval.js');
const { sentenceToString } = require('./al_print.js');

describe('PremiseGenerator', () => {

  test.each([
    [ [ 'p', 'q' ], 3, 0 ],
    [ [ 'p', 'q' ], 2, 1 ],
    [ [ 'p', 'q' ], 2, 2 ],
    [ [ 'p', 'q' ], 3, 2 ],
    [ [ 'p', 'q' ], 4, 2 ],
    [ [ 'p', 'q', 'r' ], 3, 3 ],
    [ [ 'p', 'q', 'r' ], 4, 3 ],
    [ [ 'p', 'q', 'r' ], 4, 0 ],
    [ [ 'p', 'q', 'r' ], 4, 1 ],
    [ [ 'p', 'q', 'r' ], 4, 2 ],
  ])('generates correct premise/conclusion', (letters, length, num_premises) => {
    let generator = new PremiseGenerator(letters, length, num_premises);
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
      //console.log(`RESULT: ${result.premises.map((p) => sentenceToString(p))} => ${sentenceToString(result.conclusion)}, ${non_contradictory}`);
    }
  });

});
