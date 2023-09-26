'use strict'

const { assert } = require('okljs');
const { Cache } = require('./al_cache.js');
const { getAllModels } = require('./al_models.js');
const config = require('./config.js');

class Generator {
  #params = {};
  #cache = undefined;
  #letters = undefined;

  constructor(params, letters = undefined) {
    this.#params = params;
    assert.hasProperty(this.#params, 'length');
    assert.hasProperty(this.#params, 'letters_available');
    assert.hasProperty(this.#params, 'letters_required');
    assert.hasProperty(this.#params, 'operators_available');
    assert.hasProperty(this.#params, 'operators_required');
    assert.hasProperty(this.#params, 'negation_probabilities');
    if (letters === undefined) {
      this.#letters = this.#params.letters_available;
    } else {
      this.#letters = letters;
    }
    this.#cache = new Cache(this.#letters, this.#params.letters_required.length);
    if (config.is_production) {
      this.#init(100000);
    } else {
      this.#init(1000);
    }
  }

  #init(n) {
    for (let i = 0; i < n; i++) {
      this.generateSentence();
    }
  }

  generateSentence() {
    let result = negateSentenceRandom(
      treeify(
        interleave(
          generateItemsArray(
            this.#params.length,
            'letter',
            this.#params.letters_available,
            this.#params.letters_required
          ),
          generateItemsArray(
            this.#params.length - 1,
            'operator',
            this.#params.operators_available,
            this.#params.operators_required
          )
        )
      ),
      this.#params.negation_probabilities
    );
    assert.type(result, 'Sentence');
    this.#cache.addSentence(result);
    return result;
  }

  findSentenceModelledBy(A, max_num_tries = undefined) {
    let A_models = getAllModels(A, this.#letters)[true];
    let B = this.#cache.findSentenceModelledBy(A_models);
    let num_tries = 0;
    while (B === undefined) {
      for (let i = 0; i < 5; i++) {
        this.generateSentence();
        num_tries++;
      }
      B = this.#cache.findSentenceModelledBy(A_models);
      if (max_num_tries != undefined && num_tries >= max_num_tries) {
        return undefined;
      }
    }
    return B;
  };

  findSentenceNotModelledBy(A) {
    let A_models = getAllModels(A, this.#letters)[true];
    let B = this.#cache.findSentenceNotModelledBy(A_models);
    while (B === undefined) {
      for (let i = 0; i < 5; i++) {
        this.generateSentence();
      }
      B = this.#cache.findSentenceNotModelledBy(A_models);
    }
    return B;
  };

  getAllTautologies() {
    let sentences = this.#cache.getAllSentences();
    let result = [];
    for (let s of sentences) {
      let models = getAllModels(s, this.#letters);
      if (models[false].length === 0) {
        result.push(s);
      }
    }
    return result;
  }
};

const selectRandom = (array) => array[Math.floor(Math.random() * array.length)];

const getSample = (n, m) => {
  let a = Array.from({ length: n }, (_, i) => i);

  // Do the Fisher-Yates
  for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }

  return a.slice(0, m);
}

const generateItemsArray = (length, item_key, items_available, items_required) => {
  assert.ok(items_required.length <= length);

  let result = new Array(length).fill(undefined).map(() => ({}));
  let sample = getSample(length, items_required.length);
  sample.forEach(
    (pos, i) => {
      result[pos] = { [item_key]: items_required[i] }
    });
  return result.map((l) => ((item_key in l) ? l : { [item_key]: selectRandom(items_available) }));
}

const treeify_ = (a) => {
  if (a.length == 1) {
    return a[0];
  } else {
    let i = (Math.floor(Math.random() * ((a.length - 1) / 2)) * 2) + 1;
    assert.ok('operator' in a[i], () => `${JSON.stringify(a, null, 2)}, ${i}`);
    return { lhs: treeify_(a.slice(0, i)), operator: a[i].operator, rhs: treeify_(a.slice(i+1)) }
  }
}

const treeify = (a) => {
  let result = treeify_(a);
  return result;
}

const interleave = (a1, a2) =>
  a1.map((item, index) =>
    (index < a2.length)
      ? [item, a2[index]]
      : item
  ).flat();

const negateNode = (node) => (
  { operator: 'not', operand: node }
);

const negateNodeRandom = (node, probabilities) => {
  if (Math.random() < probabilities.single) {
    if (Math.random() < probabilities.double) {
      return negateNode(negateNode(node));
    } else {
      return negateNode(node);
    }
  } else {
    return node;
  }
};

const negateSentenceRandom = (node, probabilities) => {
  if ('letter' in node) {
    return negateNodeRandom(node, probabilities.atomic);
  } else if ('operator' in node) {
    return negateNodeRandom(
      {
        lhs: negateSentenceRandom(node.lhs, probabilities),
        rhs: negateSentenceRandom(node.rhs, probabilities),
        operator: node.operator
      },
      probabilities.complex
    );
  }
  assert.fail();
};

module.exports.Generator = Generator;
module.exports.getSample = getSample;
