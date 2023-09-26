'use strict'

const { makeExercise } = require('../../exercise_al_AmodelsB.js');
const { ignoreInvalidTransition } = require('../../exercise.js');

const get = (session) => {
  return session.exercise.makeView();
};

const launch = (session, args) => {
  session.exercise = makeExercise(args.level);
  return ignoreInvalidTransition(session.exercise.launch());
};

const answer = (session, args) => {
  return ignoreInvalidTransition(session.exercise.answer(args.answer));
};

const next = (session, args) => {
  return ignoreInvalidTransition(session.exercise.ask());
};

module.exports.get = get;
module.exports.answer = answer;
module.exports.next = next;
module.exports.launch = launch;
