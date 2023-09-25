'use strict'

require('./al_grammar.js');
const { parse } = require('./al_parse.js');
const { assert } = require('okljs');
const { sentenceToString } = require('./al_print.js');
const { getAllModels, models, makeModelsSet, isSubSetOf } = require('./al_models.js');

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

const generateRandomSentence = (params) => {
  assert.hasProperty(params, 'length');
  assert.hasProperty(params, 'letters_available');
  assert.hasProperty(params, 'letters_required');
  assert.hasProperty(params, 'operators_available');
  assert.hasProperty(params, 'operators_required');
  assert.hasProperty(params, 'negation_probabilities');
  let result = negateSentenceRandom(
    treeify(
      interleave(
        generateItemsArray(
          params.length,
          'letter',
          params.letters_available,
          params.letters_required
        ),
        generateItemsArray(
          params.length - 1,
          'operator',
          params.operators_available,
          params.operators_required
        )
      )
    ),
    params.negation_probabilities
  );
  assert.type(result, 'Sentence');
  return result;
};

const getRandomIndicesArray = (n) => {
  let a = Array(n).fill(0).map((_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const findAmodelsB = (A, letters, generator, cache) => {
  if (cache[JSON.stringify(letters)] == undefined) {
    cache[JSON.stringify(letters)] = [];
  }
  let this_cache = cache[JSON.stringify(letters)];
  let A_models = makeModelsSet(A, letters);
  let indices = getRandomIndicesArray(this_cache.length);
  for (let i of indices) {
    if (isSubSetOf(A_models, this_cache[i].models)) {
      let B = this_cache[i].sentence;
      assert.ok(models(A, B), () => `${sentenceToString(A)}, ${sentenceToString(B)}`);
      return B;
    }
  }

  while (true) {
    let B = generator();
    let B_models = makeModelsSet(B, letters);
    this_cache.push({ sentence: B, models: B_models });
    if (isSubSetOf(A_models, B_models)) {
      assert.ok(models(A, B), () => `${sentenceToString(A)}, ${sentenceToString(B)}`);
      return B;
    }
  }
};

const findAnotModelsB = (A, letters, generator, cache) => {
  if (cache[JSON.stringify(letters)] == undefined) {
    cache[JSON.stringify(letters)] = [];
  }
  let this_cache = cache[JSON.stringify(letters)];
  let A_models = makeModelsSet(A, letters);
  let indices = getRandomIndicesArray(this_cache.length);
  for (let i of indices) {
    if (!isSubSetOf(A_models, this_cache[i].models)) {
      let B = this_cache[i].sentence;
      assert.ok(!models(A, B), () => `${sentenceToString(A)}, ${sentenceToString(B)}`);
      return B;
    }
  }

  while (true) {
    let B = generator();
    let B_models = makeModelsSet(B, letters);
    this_cache.push({ sentence: B, models: B_models });
    if (!isSubSetOf(A_models, B_models)) {
      assert.ok(!models(A, B), () => `${sentenceToString(A)}, ${sentenceToString(B)}`);
      return B;
    }
  }
};

module.exports.generateRandomSentence = generateRandomSentence;
module.exports.findAmodelsB = findAmodelsB;
module.exports.findAnotModelsB = findAnotModelsB;
