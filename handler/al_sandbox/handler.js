'use strict'

const { ok, err, get_err, make_ok, make_err } = require('okljs');
const { htmlToLines, linesToHtml } = require('../../html_to_lines.js');
const { parseAndCheckProof } = require('../../al_proof.js');
const { reverseTranscribeOperators } = require('../../transcribe.js');
const { errorToString } = require('../../error_to_string.js');
const util = require('util');

const get = (session) => {
  let raw = (session.raw != undefined) ? session.raw : [];
  let data = { raw: raw, error_string: null, error_line: -1 };
  if (err(session.result)) {
    data.error_string = errorToString[get_err(session.result).type];
    data.error_line = get_err(session.result).raw_line_number;
  }
  console.log(data.raw);
  return { path: 'al_sandbox/main', data: data };
};

const check = (session, args) => {
  session.raw = htmlToLines(args.raw);
  session.result = parseAndCheckProof(session.raw.map((line) => reverseTranscribeOperators(line)));
  console.log(util.inspect(session.result, { depth: null }));
  return make_ok();
}

module.exports.get = get;
module.exports.check = check;
