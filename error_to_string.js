'use strict'

const { Errors: ProofErrors } = require('./al_proof.js');

const errorToString = {
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

module.exports.errorToString = errorToString;
