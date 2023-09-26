'use strict'

const { assert } = require('okljs');
const { Generator, getSample } = require('./al_generator.js');
const { sentenceToString } = require('./al_print.js');

class PremiseGenerator {
  #letters = [];
  #generators = [];
  #B_generator = undefined;
  #num_premises = 0;
  #tautology = undefined;

  constructor(letters, length, num_premises) {
    this.#letters = letters;
    this.#num_premises = num_premises;
    let pairs = generatePairs(this.#letters);
    for (let pair of pairs) {
      this.#generators.push(
        new Generator(
          {
            length: 2,
            letters_available: pair,
            letters_required: pair,
            operators_available: [ 'follows', 'or' ],
            operators_required: [],
            negation_probabilities: {
              atomic: { single: 0.3, double: 0.0 },
              complex: { single: 0.0, double: 0.0 },
            }
          },
          this.#letters
        ));
    }
    this.#B_generator = new Generator({
      length: length,
      letters_available: letters,
      letters_required: letters,
      operators_available: [ 'follows', 'or', 'and', 'equivalent' ],
      operators_required: [],
      negation_probabilities: {
        atomic: { single: 0.3, double: 0.1 },
        complex: { single: 0.2, double: 0.1 },
      }
    });
    this.#tautology = {
      operator: 'or',
      lhs: { letter: this.#letters[0] },
      rhs: { operator: 'not', operand: { letter: this.#letters[0] } }
    };
  }

  generate() {
    let conclusion = undefined;
    let premises = undefined;
    while (conclusion === undefined) {
      premises = [];
      let sample = getSample(this.#generators.length, this.#num_premises);
      for (let index of sample) {
        premises.push(this.#generators[index].generateSentence());
      }
      let conjunction;
      if (premises.length > 1) {
        conjunction = { operator: 'and', lhs: premises[0], rhs: {} };
        let node = conjunction.rhs;
        for (let i = 1; i < (premises.length - 1); i++) {
          node.operator = 'and';
          node.lhs = premises[i];
          node.rhs = {};
          node = node.rhs;
        }
        Object.assign(node, premises[premises.length - 1]);
      } else if (premises.length === 1) {
        conjunction = premises[0];
      } else {
        conjunction = this.#tautology;
      }
      conclusion = this.#B_generator.findSentenceModelledBy(conjunction, 50);
    }
    return { premises: premises, conclusion: conclusion };
  }
};

const generatePairs = (arr) => {
  const pairs = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      pairs.push([arr[i], arr[j]]);
    }
  }
  return pairs;
}

module.exports.PremiseGenerator = PremiseGenerator;
