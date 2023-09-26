'use strict'

const { Generator } = require('./al_generator.js');

const Generators = {
  2: {
    level_1: new Generator({
        length: 2,
        letters_available: ['p', 'q'],
        letters_required: ['p' ],
        operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
        operators_required: [],
        negation_probabilities: {
          atomic: { single: 0.4, double: 0.2 },
          complex: { single: 0.2, double: 0.0 },
        }
    }),
    level_2: new Generator({
        length: 3,
        letters_available: ['p', 'q'],
        letters_required: ['p', 'q'],
        operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
        operators_required: [ 'follows' ],
        negation_probabilities: {
          atomic: { single: 0.4, double: 0.2 },
          complex: { single: 0.2, double: 0.0 },
        }
    }),
    level_3: new Generator({
        length: 3,
        letters_available: ['p', 'q'],
        letters_required: ['p', 'q'],
        operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
        operators_required: [ 'follows' ],
        negation_probabilities: {
          atomic: { single: 0.4, double: 0.2 },
          complex: { single: 0.2, double: 0.0 },
        }
    })
  }
};

module.exports.Generators = Generators;
