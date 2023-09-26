'use strict'

const { assert } = require('okljs');
const fs = require('fs');
const { sentenceToString } = require('./al_print.js');
const { getAllModels } = require('./al_models.js');

const makeLettersKey = (letters) => JSON.stringify(letters);
const makeModelKey = (model) => JSON.stringify(model);
const makeSentenceKey = (sentence) => sentenceToString(sentence);
const selectRandom = (array) => array[Math.floor(Math.random() * array.length)];

class Cache {
  #minimum_choices = 1;
  #cache = { true: { sentences: {}, children: {} }, false: { sentences: {}, children: {} } };
  #letters = [];

  constructor(letters, minimum_choices = 1) {
    this.#minimum_choices = 1;
    this.#letters = letters;
    assert.ok(this.#minimum_choices > 0);
    assert.ok(Array.isArray(this.#letters));
  }

  #getChild(node, model) {
    let key = makeModelKey(model);
    if (!node.children.hasOwnProperty(key)) {
      node.children[key] = { sentences: {}, children: {} };
    }
    return node.children[key];
  };

  #getPath(sign, models, path_number) {
    assert.ok(path_number < models.length);
    models = [...models];
    let first_model = models.splice(path_number, 1);
    models = [...first_model, ...models];
    let node = this.#cache[sign];
    let result = [node.sentences];
    for (let model of models) {
      node = this.#getChild(node, model);
      result.push(node.sentences);
    }
    return result;
  }

  #getLeaf(sign, models) {
    let node = this.#cache[sign];
    let result = node.sentences;
    for (let model of models) {
      node = this.#getChild(node, model);
      result = node.sentences;
    }
    return result;
  }

  #selectRandom(obj) {
    let keys = Object.keys(obj);
    if (keys.length < this.#minimum_choices) {
      return undefined;
    } else {
      return obj[keys[Math.floor(Math.random() * keys.length)]];
    }
  }

  addSentence(sentence) {
    let key = makeSentenceKey(sentence);
    if (!(key in this.#cache[true].sentences)) {
      let models = getAllModels(sentence, this.#letters);
      for (let sign of [true, false]) {
        for (let i = 0; i < models[sign].length; i++) {
          let path = this.#getPath(sign, models[sign], i);
          for (let p of path) {
            p[key] = sentence;
          }
        }
      }
    }
  }

  findSentenceModelledBy(models) {
    let leaf = this.#getLeaf(true, models);
    return this.#selectRandom(leaf);
  };

  findSentenceNotModelledBy(models) {
    let model = selectRandom(models);
    let leaf = this.#getLeaf(false, [model]);
    return this.#selectRandom(leaf);
  };

  writeCacheToDisk(path) {
    fs.writeFile(path, JSON.stringify(this.#cache), (err) => {
      if (err) {
        console.error('Unable to write cache to disk:', err);
      }
    });
  };

  readCacheFromDisk(path) {
    try {
      this.#cache = JSON.parse(fs.readFileSync(path));
    } catch(err) {
      console.error('Unable to read cache from disk:', err);
    }
  };

  getAllSentences() {
    return Object.values(this.#cache[true].sentences);
  }
};

module.exports.Cache = Cache;
