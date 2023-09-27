'use strict'

const { initGenerators } = require('./al_generator_static.js');
const { Generator } = require('./al_generator.js');
const { PremiseGenerator } = require('./al_premise_generator.js');
const fs = require('fs');
const path = require('path');
const tmplib = require('tmp');

describe('creates and reads cache', () => {
  let tmp;

  beforeAll(() => {
    tmp = tmplib.dirSync().name;
  });

  let Generators;

  beforeEach(() => {
    Generators = {
      test1: {
        gen1: new Generator({
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
        gen2: new Generator({
            length: 2,
            letters_available: ['p', 'q'],
            letters_required: ['p' ],
            operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
            operators_required: [],
            negation_probabilities: {
              atomic: { single: 0.4, double: 0.2 },
              complex: { single: 0.2, double: 0.0 },
            }
        })
      },
      test2: {
        gen1: new PremiseGenerator([ 'p', 'q' ], 2, 0),
        gen2: new PremiseGenerator([ 'p', 'q' ], 3, 2),
        gen3: new PremiseGenerator([ 'p', 'q', 'r' ], 3, 2),
      }
    };
  });

  const delay = (t) => new Promise((resolve) => setTimeout(resolve, t))

  test('all caches are being created', async () => {
    initGenerators(Generators, tmp, 5);
    await delay(100);
    expect(fs.existsSync(path.join(tmp, 'test1', 'gen1'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'test1', 'gen2'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen1', '0'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen1', '1'))).toBe(false);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen2', '0'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen2', '1'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen2', '2'))).toBe(false);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen3', '0'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen3', '1'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen3', '2'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen3', '3'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'test2', 'gen3', '4'))).toBe(false);
  });

  test('generators are empty at start', () => {
    expect(Generators.test1.gen1.getAllSentences()).toEqual([]);
    expect(Generators.test1.gen2.getAllSentences()).toEqual([]);
    expect(Generators.test2.gen1.getAllSentences()).toEqual([ [] ]);
    expect(Generators.test2.gen2.getAllSentences()).toEqual([ [], [] ]);
    expect(Generators.test2.gen3.getAllSentences()).toEqual([ [], [], [], [] ]);
  });

  test('all caches are being read', () => {
    initGenerators(Generators, tmp, 0);
    expect(Generators.test1.gen1.getAllSentences().length).toBeGreaterThan(0);
    expect(Generators.test1.gen2.getAllSentences().length).toBeGreaterThan(0);
    expect(Generators.test2.gen1.getAllSentences()[0].length).toBeGreaterThan(0);
    expect(Generators.test2.gen2.getAllSentences()[0].length).toBeGreaterThan(0);
    expect(Generators.test2.gen2.getAllSentences()[1].length).toBeGreaterThan(0);
    expect(Generators.test2.gen3.getAllSentences()[0].length).toBeGreaterThan(0);
    expect(Generators.test2.gen3.getAllSentences()[1].length).toBeGreaterThan(0);
    expect(Generators.test2.gen3.getAllSentences()[2].length).toBeGreaterThan(0);
    expect(Generators.test2.gen3.getAllSentences()[3].length).toBeGreaterThan(0);
  });

});
