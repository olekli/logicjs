'use strict'

const { generateRandomSentence } = require('./al_random.js');
const { getAllModels } = require('./al_models.js');
const { sentenceToString, interpretationToStrings, boolToString } = require('./al_print.js');

const selectRandom = (array) => array[Math.floor(Math.random() * array.length)];

const ExcerciseAlTof = {
  title: 'Aussagenlogik, wahr oder falsch',
  possible_answers: [ 'wahr', 'falsch' ]
};

const makeQuestion = (options) => {
  let s = generateRandomSentence(options);
  let models = getAllModels(s);
  let i;
  let expected;
  if (models.true.length === 0) {
    i = selectRandom(models.false);
    expected = false;
  } else if (models.false.length === 0) {
    i = selectRandom(models.true);
    expected = true;
  } else if (Math.random() < 0.5) {
    i = selectRandom(models.true);
    expected = true;
  } else {
    i = selectRandom(models.false);
    expected = false;
  }
  return {
    sentence: sentenceToString(s),
    interpretation: interpretationToStrings(i),
    expected: expected
  };
};

module.exports.ExcerciseAlTof = ExcerciseAlTof;
module.exports.makeQuestion = makeQuestion;
