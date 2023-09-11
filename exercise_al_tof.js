'use strict'

const { generateRandomSentence } = require('./al_random.js');
const { getAllModels } = require('./al_models.js');
const { sentenceToString, interpretationToStrings, boolToString } = require('./al_print.js');
const { Exercise } = require('./exercise.js');

const selectRandom = (array) => array[Math.floor(Math.random() * array.length)];

const levels = {
  level_1: {
    n_params: {
      total_questions: 4,
      points_required: 4,
      time_limit: 0
    },
    question_options: {
      length: 2,
      letters_available: ['p', 'q'],
      letters_required: ['p' ],
      operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
      operators_required: [],
      negation_probabilities: {
        atomic: { single: 0.4, double: 0.2 },
        complex: { single: 0.2, double: 0.0 },
      }
    }
  },
  level_2: {
    n_params: {
      total_questions: 12,
      points_required: 12,
      time_limit: 0
    },
    question_options: {
      length: 3,
      letters_available: ['p', 'q'],
      letters_required: ['p', 'q'],
      operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
      operators_required: [ 'follows' ],
      negation_probabilities: {
        atomic: { single: 0.4, double: 0.2 },
        complex: { single: 0.2, double: 0.0 },
      }
    }
  },
  level_3: {
    n_params: {
      total_questions: 12,
      points_required: 12,
      time_limit: 6 * 60 * 1000
    },
    question_options: {
      length: 3,
      letters_available: ['p', 'q'],
      letters_required: ['p', 'q'],
      operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
      operators_required: [ 'follows' ],
      negation_probabilities: {
        atomic: { single: 0.4, double: 0.2 },
        complex: { single: 0.2, double: 0.0 },
      }
    }
  }
};

class QuestionFactory {
  #options = {};

  constructor(options) {
    this.#options = options;
  }

  makeQuestion() {
    let s = generateRandomSentence(this.#options);
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
  }

  checkAnswer(question, answer) {
    let result = question.expected === answer;
    let points = result ? 1 : 0;
    return {
      result: result,
      points: points
    };
  }
};

const makeExercise = (level) => {
  let options = levels[level];
  let question_factory = new QuestionFactory(options.question_options);
  let exercise = new Exercise(
    'al_tof',
    {
      question_factory: question_factory,
      n_params: options.n_params
    }
  );
  return exercise;
};

module.exports.makeExercise = makeExercise;
