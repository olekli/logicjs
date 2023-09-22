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
        let premises_to_find = new Set(this_line.argument.premises_lines);
        let argument_type = this_line.argument.type;
        let current_depth = this_line.depth;
        let max_meta_depth = current_depth + 1;
        let i = this_line.line_number;
        while ((premises_to_find.size > 0) && (i > 0)) {
          i--;
          let this_line = parsed_lines[i];
          if (this_line.depth < current_depth) {
            current_depth = this_line.depth;
            max_meta_depth = current_depth;
          }
          if (premises_to_find.has(this_line.line_number)) {
            if (
                   ((argument_type === 'meta') && (this_line.depth === max_meta_depth))
                || ((argument_type === 'object') && (this_line.depth === current_depth))
            ) {
              premises_to_find.delete(this_line.line_number);
            }
          }
        }
        if (premises_to_find.size != 0) {
          return error(this_line, Errors.InaccessiblePremise);
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
          let result = checkArgument(
            this_argument.name,
            this_argument.premises_lines.map((line_number) => parsed_lines[line_number].sentence),
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

const checkProof = (parsed_lines, allowed_premises = null) =>
  checkArguments(
    checkAllowedPremises(
      checkNumbering(
        checkAccessibilityOfPremises(
          parsed_lines
        )
      ),
      allowed_premises
    )
  );

module.exports.checkProof = checkProof;
module.exports.CheckerErrors = Errors;
