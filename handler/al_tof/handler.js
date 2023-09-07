'use strict'

const { ExcerciseAlTof, makeQuestion } = require('../../exercise_al_tof.js');
const { boolToString } = require('../../al_print.js');
const { getSession } = require('../../session.js');
const path = require('path');

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

const handle_ = (session) => {
  switch (session.state) {
    case 'asked':
      return {
        path: 'al_tof/asked',
        data: {
          sentence: session.question.sentence,
          interpretation: session.question.interpretation
        }
      };
    case 'answered':
      return {
        path: 'al_tof/answered',
        data: {
          sentence: session.question.sentence,
          interpretation: session.question.interpretation,
          answer: boolToString(session.answer),
          result: session.result ? 'richtig' : 'falsch',
          expected: boolToString(session.question.expected)
        }
      };
    default:
      session.state = 'asked';
      session.question = makeQuestion(options);
      return handle_(session);
   }
};

const get = (req, res, next) => {
  let session = getSession(req.auth, 'al_tof');
  req.view = handle_(session);
  next();
};

const post = (req, res, next) => {
  let session = getSession(req.auth, 'al_tof');
  if (req.body.method === 'answer') {
    if (session.state != 'asked') {
      next('invalid state transition');
    } else {
      session.state = 'answered';
      session.answer = req.body.answer;
      session.result = (session.question.expected === session.answer);
      res.redirect(path.join(req.baseUrl, req.path, '..'));
    }
  } else if (req.body.method === 'next') {
    if (session.state != 'answered') {
      next('invalid state transition');
    } else {
      Object.keys(session).forEach((key) => { delete session[key]; });
      res.redirect(path.join(req.baseUrl, req.path, '..'));
    }
  }
};

module.exports.handle_ = handle_;
module.exports.get = get;
module.exports.post = post;
