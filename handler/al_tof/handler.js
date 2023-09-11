'use strict'

const { makeExercise } = require('../../exercise_al_tof.js');
const { make_ok, make_err } = require('okljs');

const get = (session) => {
  return session.exercise.makeView();
};

const launch = (session, args) => {
  session.exercise = makeExercise(args.level);
  return session.exercise.launch();
};

const answer = (session, args) => {
  return session.exercise.answer(args.answer);
};

const next = (session, args) => {
  return session.exercise.ask();
};

module.exports.get = get;
module.exports.answer = answer;
module.exports.next = next;
module.exports.launch = launch;
