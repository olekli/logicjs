'use strict'

const { assert, make_ok, make_err, match_result, make_result, ok, err } = require('okljs');
const nearley = require('nearley');
const grammar = require('./al_grammar_proof.js');
const { Arguments } = require('./al_argument_definitions.js');
const util = require('util');

const error = (this_line, type) =>
  make_err({ type: type, raw_line_number: this_line.raw_line_number, parsed_line: this_line })

const Errors = {
  InvalidLine: Symbol('InvalidLine'),
  InvalidDepth: Symbol('InvalidDepth'),
  ExpectedSeparatorOrPremise: Symbol('ExpectedSeparatorOrPremise'),
  ExpectedSeparator: Symbol('ExpectedSeparator'),
  ExpectedPremise: Symbol('ExpectedPremise'),
  ExpectedAssumption: Symbol('ExpectedAssumption'),
  InvalidArgumentName: Symbol('InvalidArgumentName'),
  ParserError: Symbol('ParserError'),
};

const parseLine = (string) => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  let result = make_result(() => parser.feed(string));
  return match_result(result,
    (ok) => {
      if (parser.results.length === 1) {
        return make_ok(parser.results[0]);
      } else {
        return make_err();
      }
    }
  );
};

const checkDepth = (arg, this_line, expected_depth) => {
  if (this_line.depth === expected_depth) {
    return make_ok();
  } else {
    return error(this_line, Errors.InvalidDepth);
  }
};

const parsePremiseOrSeparator = (arg, this_line) => {
  if (this_line.type === undefined) {
    return error(this_line, Errors.ExpectedSeparatorOrPremise);
  } else if (this_line.type === 'separator') {
    return parseSeparator(arg, this_line);
  } else if (this_line.type === 'sentence' && this_line.argument.name === 'V') {
    return parsePremise(arg, this_line);
  } else {
    return error(this_line, Errors.ExpectedSeparatorOrPremise);
  }
};

const parseSeparator = (arg, this_line) => {
  if (this_line.type === undefined) {
    return error(this_line, Errors.ExpectedSeparator);
  } else if (this_line.type === 'separator') {
    return make_ok();
  } else {
    return error(this_line, Errors.ExpectedSeparator);
  }
};

const parsePremise = (arg, this_line) => {
  if (this_line.type === undefined) {
    return error(this_line, Errors.ExpectedPremise);
  } else if (this_line.type === 'sentence' && this_line.argument.name === 'V') {
    let result = checkDepth(arg, this_line, 1);
    if (err(result)) {
      return result;
    }
    arg.result.push(this_line);
    return nextLine(arg, parsePremiseOrSeparator);
  } else {
    return error(this_line, Errors.ExpectedPremise);
  }
};

const parseAssumption = (arg, this_line) => {
  if (this_line.type === undefined) {
    return error(this_line, Errors.ExpectedAssumption);
  } else if (this_line.type === 'sentence' && this_line.argument.name === 'A') {
    arg.result.push(this_line);
    let result = nextLine(arg, parseSeparator);
    if (err(result)) {
      return result;
    }
    return nextLine(arg, parseArgumentOrSubproof);
  } else {
    return error(this_line, Errors.ExpectedAssumption);
  }
};

const parseArgument = (arg, this_line) => {
  if (this_line.type === undefined) {
    return make_ok();
  } else if (this_line.argument.name in Arguments) {
    arg.result.push(this_line);
    return nextLine(arg, parseArgumentOrSubproof);
  } else {
    return error(this_line, Errors.InvalidArgumentName);
  }
};

const parseArgumentOrSubproof = (arg, this_line) => {
  if (
       (arg.result.length > 0)
    && this_line
    && (this_line.depth > arg.result[arg.result.length - 1].depth)
  ) {
    return parseAssumption(arg, this_line);
  } else {
    return parseArgument(arg, this_line);
  }
};

const nextLine = (arg, parser) => {
  let this_line = {};
  if (arg.index < arg.lines.length) {
    this_line = parseLine(arg.lines[arg.index]);
  }
  let this_raw_line_number = arg.index;
  arg.index++;
  if (parser != undefined) {
    return match_result(this_line,
      (this_line) => parser(arg, { ...this_line, raw_line_number: this_raw_line_number }),
      (err) => error({ raw_line_number: this_raw_line_number }, Errors.ParserError)
    );
  } else {
    return this_line;
  }
};

const parseProof = (lines) => {
  let arg = { lines: lines, index: 0, result: [] };
  let result = nextLine(arg, parsePremiseOrSeparator);
  if (err(result)) {
    return result;
  }
  result = nextLine(arg, parseArgumentOrSubproof);
  if (err(result)) {
    return result;
  }
  return make_ok(arg.result);
};

module.exports.parseProof = parseProof;
module.exports.error = error;
module.exports.ParserErrors = Errors;
