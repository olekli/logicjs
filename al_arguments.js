// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { assert, unmake_result, ok, make_ok, make_err, get_ok, make_result, map_result, match_result } = require('okljs');
const _ = require('lodash');
const util = require('util');
const fs = require('fs');
const { Arguments } = require('./al_argument_definitions.js');

const Errors = {
  IncompatibleMapping: Symbol('IncompatibleMapping'),
  IncompatibleOperators: Symbol('IncompatibleOperators'),
  InvalidArgumentUsage: Symbol('InvalidArgumentUsage'),
  ArgumentDoesNotMatch: Symbol('ArgumentDoesNotMatch')
};

const joinMapping = (lhs, rhs) => {
  let result = { ...lhs };
  for (let key in rhs) {
    if (key in lhs) {
      if (!_.isEqual(lhs[key], rhs[key])) {
        return make_err(Errors.IncompatibleMapping);
      }
    } else {
      result[key] = rhs[key];
    }
  }
  return make_ok(result);
};

const matchMappings_ = (lhs, rhs) => {
  for (let key in rhs) {
    if (key in lhs) {
      if (!_.isEqual(lhs[key], rhs[key])) {
        return false;
      }
    }
  }
  return true;
};

const matchMappings = (mappings) => {
  return mappings.map((ref) =>
    mappings.map((mapping) => matchMappings_(ref, mapping))
      .reduce((result, current) => result && current)
  ).reduce((result, current) => result && current);
};

const matchSentence = (pattern, sentence) => {
  if (pattern.letter != undefined) {
    return make_ok({ [pattern.letter]: sentence });
  } else if (pattern.operator === sentence.operator) {
    if ([ 'equivalent', 'follows', 'or', 'and'].includes(pattern.operator)) {
      let mapping_lhs = matchSentence(pattern.lhs, sentence.lhs);
      let mapping_rhs = matchSentence(pattern.rhs, sentence.rhs);
      let mappings = map_result([mapping_lhs, mapping_rhs], (unwrap, e) => unwrap(e));
      return match_result(mappings,
        (ok) => joinMapping(ok[0], ok[1])
      );
    } else if (pattern.operator === 'not') {
      return make_result(matchSentence(pattern.operand, sentence.operand));
    } else {
      assert.fail();
    }
  } else {
    return make_err(Errors.IncompatibleOperators);
  }
}

const matchObjectArgument = (premises_patterns, conclusion_pattern, premises, conclusion) => {
  assert.ok(premises_patterns.length === premises.length);
  let mappings = [];
  for (let i = 0; i < premises_patterns.length; i++) {
    mappings.push(matchSentence(premises_patterns[i], premises[i]));
  }
  mappings.push(matchSentence(conclusion_pattern, conclusion));
  return match_result(
    map_result(
      mappings,
      (unwrap, e) => unwrap(e)
    ),
    (ok) => matchMappings(ok) ? make_ok() : make_err(Errors.ArgumentDoesNotMatch)
  );
};

const intersection = (lhs, rhs) => {
  let result = new Set();
  for (let e of lhs) {
    if (rhs.has(e)) {
      result.add(e);
    }
  }
  return result;
};

const matchMetaArgument = (inferences, conclusion_pattern, proof, conclusion) => {
  return match_result(matchSentence(conclusion_pattern, conclusion),
    (conclusion_mapping) => {
      let assumption = proof[0];
      let possible_inferences =
        proof.map((s) => ({ operator: 'follows', lhs: assumption, rhs: s }));
      let possible_mappings_for_each_inference =
        inferences.map((inference) =>
          possible_inferences.map((s) =>
            matchSentence(inference, s)
          ).filter((s) => ok(s)).map((s) => get_ok(s))
        );
      possible_mappings_for_each_inference =
        possible_mappings_for_each_inference.map((mappings) =>
          mappings.filter((mapping) => matchMappings_(mapping, conclusion_mapping))
        );
      let reference_mappings = [ ...possible_mappings_for_each_inference[0] ];
      let for_each_reference_mapping_all_matching_mappings_of_each_inference =
        reference_mappings.map((reference_mapping) =>
          possible_mappings_for_each_inference.map((mappings) =>
            mappings.filter((mapping) =>
              matchMappings_(mapping, reference_mapping)
            )
          )
        );
      let result = for_each_reference_mapping_all_matching_mappings_of_each_inference
        .filter((array_of_mappings) =>
          array_of_mappings.reduce(
            (result, current) => result && (current.length > 0),
            array_of_mappings.length > 0
          )
        );
      if (result.length > 0) {
        return make_ok();
      } else {
        return make_err(Errors.ArgumentDoesNotMatch);
      }
    }
  );
};

const checkSingleArgument = (argument, premises, conclusion) => {
  if (argument.type === 'object') {
    if (premises.length != argument.arity) {
      return make_err(Errors.InvalidArgumentUsage);
    } else {
      return match_result(
        matchObjectArgument(
          argument.premises,
          argument.conclusion,
          premises,
          conclusion
        ),
        (ok) => make_ok(),
        (err) => make_err(Errors.ArgumentDoesNotMatch)
      );
    }
  } else if (argument.type === 'meta') {
    return match_result(
      matchMetaArgument(
        argument.premises,
        argument.conclusion,
        premises,
        conclusion
      ),
      (ok) => make_ok(),
      (err) => make_err(Errors.ArgumentDoesNotMatch)
    );
  }
  assert.fail();
}

const checkArgument = (argument_name, premises, conclusion) => {
  if (argument_name in Arguments) {
    for (let argument of Arguments[argument_name]) {
      if (ok(checkSingleArgument(argument, premises, conclusion))) {
        return make_ok();
      }
    }
  }
  return make_err(Errors.ArgumentDoesNotMatch);
}

module.exports.matchSentence = matchSentence;
module.exports.matchObjectArgument = matchObjectArgument;
module.exports.matchMetaArgument = matchMetaArgument;
module.exports.checkArgument = checkArgument;
