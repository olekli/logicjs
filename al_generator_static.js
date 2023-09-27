'use strict'

const { Generator } = require('./al_generator.js');
const { PremiseGenerator } = require('./al_premise_generator.js');
const path = require('path');

const Generators = {
  al_tof: {
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
  },
  al_models: {
    level_1: new PremiseGenerator([ 'p', 'q' ], 2, 1),
    level_2: new PremiseGenerator([ 'p', 'q' ], 3, 2),
  },
  al_proofs: {
    tautologies_1: new PremiseGenerator([ 'p' ], 2, 0),
    tautologies_2: new PremiseGenerator([ 'p', 'q' ], 3, 0),
    tautologies_3: new PremiseGenerator([ 'p', 'q', 'r' ], 4, 0),
    premises_1: new PremiseGenerator([ 'p', 'q' ], 2, 1),
    premises_2: new PremiseGenerator([ 'p', 'q', 'r' ], 3, 2),
    premises_3: new PremiseGenerator([ 'p', 'q', 'r' ], 4, 3),
  }
};

const initGenerators = (generators, base_path, n) => {
  for (let key1 in generators) {
    let key1_path = path.join(base_path, key1);
    for (let key2 in generators[key1]) {
      let key2_path = path.join(key1_path, key2);
      if (!generators[key1][key2].readCache(key2_path)) {
        generators[key1][key2].initRandom(n);
        generators[key1][key2].writeCache(key2_path);
      }
    }
  }
};

module.exports.Generators = Generators;
module.exports.initGenerators = initGenerators;
