'use strict'

const { ok, err, get_err, make_ok, make_err } = require('okljs');
const { htmlToLines, linesToHtml } = require('../../html_to_lines.js');
const { reverseTranscribeOperators } = require('../../transcribe.js');
const { errorToString } = require('../../error_to_string.js');
const { ExerciseAlProofs } = require('../../exercise_al_proofs.js');

const get = (session) => {
  let raw = (session.raw != undefined) ? session.raw : [];
  let current = session.exercise.current;
  let data = {
    premises: current.premises,
    conclusion: current.conclusion,
    raw: raw,
    error_string: null,
    error_line: -1
  };
  if (err(session.result)) {
    data.error_string = errorToString(get_err(session.result));
    data.error_line = get_err(session.result).raw_line_number;
    if (data.error_line === undefined) {
      data.error_line = null;
    }
  }
  return { path: 'al_proofs/main', data: data };
};

const check = (session, args) => {
  session.raw = htmlToLines(args.raw);
  session.result = session.exercise.checkAnswer(
    session.raw.map(
      (line) => reverseTranscribeOperators(line)
    ));
  return make_ok();
};

const reset = (session, args) => {
  session.raw = [];
  session.result = make_ok();
  return make_ok();
};

const launch = (session, args) => {
  reset(session, {});
  session.exercise = new ExerciseAlProofs(args.mode);
  return make_ok();
};

const newExercise = (session, args) => {
  session.exercise.newExercise();
  return make_ok();
};

module.exports.get = get;
module.exports.check = check;
module.exports.reset = reset;
module.exports.launch = launch;
module.exports.newExercise = newExercise;
