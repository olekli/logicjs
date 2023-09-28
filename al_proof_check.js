// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { assert, make_ok, make_err, match_result, make_result, ok, err } = require('okljs');
const { error } = require('./al_proof_parse.js');
const { checkArgument } = require('./al_arguments.js');
const _ = require('lodash');

const Errors = {
  InvalidNumbering: Symbol('InvalidNumbering'),
  InaccessiblePremise: Symbol('InaccessiblePremise'),
  InvalidArgumentApplication: Symbol('InvalidArgumentApplication'),
  InvalidPremise: Symbol('InvalidPremise'),
  MissingExpectedConclusion: Symbol('MissingExpectedConclusion'),
};

const checkNumbering = (parsed_lines) => {
  return match_result(parsed_lines,
    (parsed_lines) => {
      for (let index = 0; index < parsed_lines.length; index++) {
        let this_line = parsed_lines[index];
        if (this_line.line_number != index) {
          return error(this_line, Errors.InvalidNumbering);
        }
      }
      return make_ok(parsed_lines);
    }
  );
};

const checkAccessibilityOfPremises = (parsed_lines) => {
  return match_result(parsed_lines,
    (parsed_lines) => {
      for (let this_line of parsed_lines) {
        for (let premise_line of this_line.argument.premises_lines) {
          if (premise_line >= this_line.line_number) {
            return error(this_line, Errors.InaccessiblePremise);
          }
        }
        if (this_line.argument.type === 'object') {
          let premises_to_find = new Set(this_line.argument.premises_lines);
          let current_depth = this_line.depth;
          let i = this_line.line_number;
          while ((premises_to_find.size > 0) && (i > 0)) {
            i--;
            let this_line = parsed_lines[i];
            if (this_line.depth < current_depth) {
              current_depth = this_line.depth;
            }
            if (premises_to_find.has(this_line.line_number) && (this_line.depth === current_depth)) {
              premises_to_find.delete(this_line.line_number);
            }
          }
          if (premises_to_find.size != 0) {
            return error(this_line, Errors.InaccessiblePremise);
          }
        } else if (this_line.argument.type === 'meta') {
          let current_depth = this_line.depth;
          let i = this_line.line_number;
          let a = this_line.argument.premises_lines[0];
          let b = this_line.argument.premises_lines[1];
          while (i > b) {
            i--;
            let this_line = parsed_lines[i];
            if (this_line.depth < current_depth) {
              current_depth = this_line.depth;
            }
          }
          let meta_depth = current_depth + 1;
          for (i = a; i <= b; i++) {
            if (parsed_lines[i].depth < meta_depth) {
              return error(this_line, Errors.InaccessiblePremise);
            }
          }
        } else {
          assert.fail();
        }
      }
      return make_ok(parsed_lines);
    }
  );
};

const checkAllowedPremises = (parsed_lines, allowed_premises) => {
  return match_result(parsed_lines,
    (parsed_lines) => {
      if (allowed_premises === null) {
        return make_ok(parsed_lines);
      } else {
        for (let this_line of parsed_lines) {
          if (this_line.argument.name === 'V') {
            if (!allowed_premises.some((premise) => _.isEqual(premise, this_line.sentence))) {
              return error(this_line, Errors.InvalidPremise);
            }
          }
        }
        return make_ok(parsed_lines);
      }
    }
  );
};

const checkArguments = (parsed_lines) => {
  return match_result(parsed_lines,
    (parsed_lines) => {
      for (let this_line of parsed_lines) {
        let this_argument = this_line.argument;
        if (this_argument.name != 'V' && this_argument.name != 'A') {
          let premises_lines = [];
          if (this_argument.type === 'object') {
            premises_lines =
              this_argument.premises_lines.map((line_number) =>
                parsed_lines[line_number].sentence
              );
          } else if (this_argument.type === 'meta') {
            let a = this_argument.premises_lines[0];
            let b = this_argument.premises_lines[1];
            let lines_to_consider =
              Array.from(
                {
                  length: b - a + 1
                },
                (_, i) => a + i
              ).filter((line_number) =>
                parsed_lines[line_number].depth === parsed_lines[a].depth
              );
            premises_lines =
              lines_to_consider.map((line_number) =>
                parsed_lines[line_number].sentence
              );
          } else {
            assert.fail();
          }
          let result = checkArgument(
            this_argument.name,
            premises_lines,
            this_line.sentence
          );
          if (err(result)) {
            return error(this_line, Errors.InvalidArgumentApplication);
          }
        }
      }
      return make_ok(parsed_lines);
    }
  );
};

const checkConclusion = (parsed_lines, expected_conclusion) => {
  return match_result(parsed_lines,
    (parsed_lines) => {
      if (expected_conclusion === null) {
        return make_ok(parsed_lines);
      } else {
        for (let this_line of parsed_lines) {
          if (_.isEqual(this_line.sentence, expected_conclusion)) {
            return make_ok(parsed_lines);
          }
        }
        return error(undefined, Errors.MissingExpectedConclusion);
      }
    }
  );
};

const checkProof = (parsed_lines, allowed_premises = null, expected_conclusion = null) =>
  checkConclusion(
    checkArguments(
      checkAllowedPremises(
        checkNumbering(
          checkAccessibilityOfPremises(
            parsed_lines
          )
        ),
        allowed_premises
      )
    ),
    expected_conclusion
  );

module.exports.checkProof = checkProof;
module.exports.CheckerErrors = Errors;
