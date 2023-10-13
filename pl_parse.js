// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { assert, make_ok, make_err, match_result } = require('okljs');
const nearley = require('nearley');
const grammar = require('./pl_grammar.js');

const Errors = {
  SyntaxError: Symbol('SyntaxError'),
  UnboundVariable: SyntaxError('UnboundVariable'),
};

const parse_ = (string) => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  try {
    parser.feed(string);
  } catch(err) {
  }
  if (parser.results?.length === 1) {
    return make_ok(parser.results[0]);
  } else {
    return make_err(Errors.SyntaxError);
  }
}

const checkVariables = (sentence, bound_variables = []) =>
  match_result(sentence,
    (sentence) => {
      let checkQuantor = (sentence, bound_variables) =>
        checkVariables(sentence.sentence, [ ...bound_variables, sentence.variable ]);
      if ('lhs' in sentence && 'rhs' in sentence) {
        return match_result(checkVariables(sentence.lhs, bound_variables),
          (ok) => checkVariables(sentence.rhs, bound_variables)
        );
      } else if ('operand' in sentence) {
        return checkVariables(sentence.operand, bound_variables);
      } else if ('sentence' in sentence) {
        return checkQuantor(sentence, bound_variables);
      } else if ('objects' in sentence) {
        let result = sentence.objects.reduce(
          (result, variable) =>
            result && (!(['x', 'y', 'z'].includes(variable)) || bound_variables.includes(variable)),
            true
        );
        return result ? make_ok(sentence) : make_err(Errors.UnboundVariable);
      }
      console.log(JSON.stringify(sentence, null, 2));
      assert.fail();
    }
  );

const parse = (string) =>
  checkVariables(parse_(string));

module.exports.parse = parse;
module.exports.Errors = Errors;
