// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { parseProof, ParserErrors } = require('./al_proof_parse.js');
const { checkProof, CheckerErrors } = require('./al_proof_check.js');

module.exports.parseAndCheckProof =
  (raw_lines, premises = null, conclusion = null) =>
    checkProof(
      parseProof(raw_lines),
      premises,
      conclusion
    );
module.exports.Errors = { ...ParserErrors, ...CheckerErrors };
