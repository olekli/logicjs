'use strict'

const { Exercise } = require('./exercise.js');
const { sentenceToString } = require('./al_print.js');
const { Generators } = require('./al_generator_static.js');

const levels = {
  level_1: {
    n_params: {
      total_questions: 6,
      points_required: 6,
      time_limit: 0
    },
    generator: Generators.al_models.level_1
  },
  level_2: {
    n_params: {
      total_questions: 6,
      points_required: 6,
      time_limit: 0
    },
    generator: Generators.al_models.level_2
  },
  level_3: {
    n_params: {
      total_questions: 6,
      points_required: 6,
      time_limit: 6 * 60 * 1000
    },
    generator: Generators.al_models.level_2
  }
};

const cache = {};

class QuestionFactory {
  #generator = {};

  constructor(generator) {
    this.#generator = generator;
  }

  makeQuestion() {
    let result = {};
    let expected;
    if (Math.random() < 0.5) {
      result = this.#generator.generate();
      expected = true;
    } else {
      result = this.#generator.generate(false);
      expected = false;
    }
    return {
      premises: result.premises.map((p) => sentenceToString(p)),
      conclusion: sentenceToString(result.conclusion),
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
  let question_factory = new QuestionFactory(options.generator);
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
