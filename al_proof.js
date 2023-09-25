'use strict'

const { parseProof, ParserErrors } = require('./al_proof_parse.js');
const { checkProof, CheckerErrors } = require('./al_proof_check.js');

module.exports.parseAndCheckProof = (raw_lines) => checkProof(parseProof(raw_lines));
module.exports.Errors = { ...ParserErrors, ...CheckerErrors };