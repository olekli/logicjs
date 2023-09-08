'use strict'

const { ExcerciseAlTof, makeQuestion } = require('../../exercise_al_tof.js');
const { boolToString } = require('../../al_print.js');
const { getSession } = require('../../session.js');
const path = require('path');
const { make_ok, make_err } = require('okljs');

const games = {
  level_1: {
    num_total_questions: 12,
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
    },
    points_required: 12,
    time_limit: 0
  },
  level_2: {
    num_total_questions: 12,
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
    },
    points_required: 12,
    time_limit: 0
  },
  level_3: {
    num_total_questions: 12,
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
    },
    points_required: 12,
    time_limit: 0
  }
};

const get = (session) => {
  switch (session.state) {
    case 'asked':
      return make_ok({
        path: 'al_tof/asked',
        data: {
          sentence: session.question.sentence,
          interpretation: session.question.interpretation,
          num_current_question: session.num_current_question
        }
      });
    case 'answered':
      return make_ok({
        path: 'al_tof/answered',
        data: {
          sentence: session.question.sentence,
          interpretation: session.question.interpretation,
          answer: boolToString(session.answer),
          result: session.result ? 'richtig' : 'falsch',
          expected: boolToString(session.question.expected),
          num_current_question: session.num_current_question
        }
      });
    case 'finished':
      return make_ok({
        path: 'al_tof/finished',
        data: {
          points_required: session.game.points_required,
          points_achieved: session.points,
          result: (session.points >= session.game.points_required)
        }
      });
    default:
      return make_err();
   }
};

const launch = (session, args) => {
  session.game = games[args.level];
  session.question = makeQuestion(session.game.question_options);
  session.num_current_question = 1;
  session.points = 0;
  session.state = 'asked';
  return make_ok();
};

const answer = (session, args) => {
  if (session.state != 'asked') {
    return make_err('invalid state transition');
  } else {
    session.state = 'answered';
    session.answer = args.answer;
    session.result = (session.question.expected === session.answer);
    if (session.question.expected === session.answer) {
      session.points++;
    }
    return make_ok();
  }
};

const next = (session, args) => {
  if (session.state != 'answered') {
    return make_err('invalid state transition');
  } else {
    delete session['question'];
    delete session['answer'];
    delete session['result'];
    session.num_current_question++;
    if (session.num_current_question <= session.game.num_total_questions) {
      session.state = 'asked';
      session.question = makeQuestion(session.game.question_options);
      return make_ok();
    } else {
      session.state = 'finished';
      return make_ok();
    }
  }
};

module.exports.get = get;
module.exports.answer = answer;
module.exports.next = next;
module.exports.launch = launch;
