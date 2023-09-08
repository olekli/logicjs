'use strict'

const { ExcerciseAlTof, makeQuestion } = require('../../exercise_al_tof.js');
const { boolToString } = require('../../al_print.js');
const { getSession } = require('../../session.js');
const path = require('path');
const { make_ok, make_err } = require('okljs');

const options = {
  length: 3,
  letters_available: ['p', 'q'],
  letters_required: ['p', 'q'],
  operators_available: [ 'equivalent', 'follows', 'or', 'and' ],
  operators_required: [ 'follows' ],
  negation_probabilities: {
    atomic: { single: 0.4, double: 0.2 },
    complex: { single: 0.2, double: 0.0 },
  }
};

const get = (session) => {
  switch (session.state) {
    case 'asked':
      return make_ok({
        path: 'al_tof/asked',
        data: {
          sentence: session.question.sentence,
          interpretation: session.question.interpretation
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
          expected: boolToString(session.question.expected)
        }
      });
    default:
      return make_err();
   }
};

const launch = (session, args) => {
  session.state = 'asked';
  session.question = makeQuestion(options);
  return make_ok();
};

const answer = (session, args) => {
  if (session.state != 'asked') {
    return make_err('invalid state transition');
  } else {
    session.state = 'answered';
    session.answer = args.answer;
    session.result = (session.question.expected === session.answer);
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
    session.state = 'asked';
    session.question = makeQuestion(options);
    return make_ok();
  }
};

module.exports.get = get;
module.exports.answer = answer;
module.exports.next = next;
module.exports.launch = launch;
