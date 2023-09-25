'use strict'

const { Errors: ProofErrors } = require('./al_proof.js');

const errorToStringMap = {
  [ProofErrors.InvalidArgumentApplication]: 'ungültiges Argument',
  [ProofErrors.InvalidNumbering]: 'ungültige Nummerierung',
  [ProofErrors.InaccessiblePremise]: 'Argument verwendet ungültige Prämisse',
  [ProofErrors.InvalidPremise]: 'ungültige Prämisse',
  [ProofErrors.InvalidDepth]: 'Syntaxfehler',
  [ProofErrors.ExpectedSeparatorOrPremise]: 'Separator oder Prämisse erwartet',
  [ProofErrors.ExpectedSeparator]: 'Separator erwartet',
  [ProofErrors.ExpectedPremise]: 'Prämisse erwartet',
  [ProofErrors.ExpectedAssumption]: 'Annahme erwartet',
  [ProofErrors.InvalidArgumentName]: 'unbekanntes Argument',
  [ProofErrors.ParserError]: 'Syntaxfehler'
};

const errorToString = (error) => {
  let line_number = error.parsed_line?.line_number;
  let line_type = line_number != undefined ? 'Satz' : 'Zeile';
  let location = line_number != undefined ? line_number : error.raw_line_number;
  return `${errorToStringMap[error.type]} in ${line_type} ${location + 1}`;
};

module.exports.errorToString = errorToString;
