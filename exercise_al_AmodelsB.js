'use strict'

const { Exercise } = require('./exercise.js');
const { findAmodelsB, findAnotModelsB, generateRandomSentence } = require('./al_random.js');
const { sentenceToString } = require('./al_print.js');

const levels = {
  level_1: {
    n_params: {
      total_questions: 6,
      points_required: 6,
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
      total_questions: 6,
      points_required: 6,
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
      total_questions: 6,
      points_required: 6,
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

const cache = [];

class QuestionFactory {
  #options = {};

  constructor(options) {
    this.#options = options;
  }

  makeQuestion() {
    let lhs = generateRandomSentence(this.#options);
    let rhs;
    let expected;
    if (Math.random() < 0.5) {
      rhs = findAmodelsB(lhs, () => generateRandomSentence(this.#options), cache);
      expected = true;
    } else {
      rhs = findAnotModelsB(lhs, () => generateRandomSentence(this.#options), cache);
      expected = false;
    }
    return {
      lhs: sentenceToString(lhs),
      rhs: sentenceToString(rhs),
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
    'al_AmodelsB',
    {
      question_factory: question_factory,
      n_params: options.n_params
    }
  );
  return exercise;
};

module.exports.makeExercise = makeExercise;
