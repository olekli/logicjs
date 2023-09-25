'use strict'

const { sentenceToString } = require('./al_print.js');
const { Generator } = require('./al_generator.js');
const { getAllModels, models } = require('./al_models.js');

const makeSentenceKey = (sentence) => sentenceToString(sentence);

let generator = new Generator({
  length: 3,
  letters_available: ['p', 'q', 'r'],
  letters_required: ['p', 'q', 'r'],
  operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
  operators_required: [],
  negation_probabilities: {
    atomic: { single: 0.4, double: 0.2 },
    complex: { single: 0.2, double: 0.0 },
  }
});

let sentences = {};

let t0 = Date.now();
for (let i = 0; i < 100000; i++) {
  let s = generator.generateSentence();
  sentences[makeSentenceKey(s)] = s;
}
console.log('time 0:', Date.now() - t0);

console.log('size:', Object.keys(sentences).length);

t0 = Date.now();
for (let i = 0; i < 100; i++) {
  let A = generator.generateSentence();
  for (let j = 0; j < 100; j++) {
    let B = generator.findSentenceModelledBy(A);
    if (B === undefined) {
      throw 'foo';
    }
  }
}
console.log('time 1:', Date.now() - t0);

//t0 = Date.now();
//for (let i = 0; i < 100; i++) {
//  let A = generator.generateSentence();
//  for (let j = 0; j < 100; j++) {
//    while (true) {
//      let B = generator.generateSentence();
//      if (models(A, B)) {
//        break;
//      }
//    }
//  }
//}
//console.log('time 2:', Date.now() - t0);

// for (let i = 0; i < 10000000; i++) {
//   let s = generator.generateSentence();
//   sentences[makeSentenceKey(s)] = s;
// }
//
// console.log('2 size:', Object.keys(sentences).length);
// 
// for (let i = 0; i < 10000000; i++) {
//   let s = generator.generateSentence();
//   sentences[makeSentenceKey(s)] = s;
// }
// 
// console.log('3 size:', Object.keys(sentences).length);
