// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { assert, unmake_result, ok, make_ok, make_err, get_ok, make_result, map_result, match_result, unzip_result } = require('okljs');
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

const isMappingCompatible = (lhs, rhs) => {
  for (let key in rhs) {
    if (key in lhs) {
      if (!_.isEqual(lhs[key], rhs[key])) {
        return false;
      }
    }
  }
  return true;
};

const addMapping = (mapping, pattern, sentence) =>
  match_result(mapping,
    (current_mapping) => match_result(matchSentence(pattern, sentence),
      (new_mapping) => joinMapping(current_mapping, new_mapping)
    )
  );

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
};

const metaArgumentGetCompatibleMappings = (mapping, inference, proof) => {
  return match_result(mapping,
    (current_mapping) => {
      let assumption = proof[0];
      let possible_inferences =
        proof.map((s) => ({ operator: 'follows', lhs: assumption, rhs: s }));
      let possible_mappings_for_each_inference =
        possible_inferences.map((s) =>
          matchSentence(inference, s)
        ).filter((m) => ok(m))
         .map((m) => get_ok(m))
         .filter((m) => isMappingCompatible(current_mapping, m));
      return make_ok(possible_mappings_for_each_inference);
    }
  );
};

const hasIntersection = (mappings_array) => {
  return match_result(mappings_array,
    (mappings_array) => {
      let intersection = _.intersectionWith(...mappings_array, _.isEqual);
      if (intersection.length > 0) {
        return make_ok();
      } else {
        return make_err(Errors.ArgumentDoesNotMatch);
      }
    }
  );
};

const checkSingleArgument = (argument, premises, conclusion) => {
  while (argument.arity > premises.length) {
    premises.push(premises[premises.length - 1]);
  }
  let mapping = {};
  mapping = addMapping(mapping, argument.conclusion, conclusion);
  let meta = [];
  for (let i = 0; i < argument.premises.length; i++) {
    if (argument.premises[i].type === 'object') {
      mapping = addMapping(mapping, argument.premises[i].sentence, premises[i]);
    } else if (argument.premises[i].type === 'meta') {
      meta.push({ premise: argument.premises[i].sentence, proof: premises[i] });
    } else {
      assert.fail();
    }
  }
  if (meta.length > 0) {
    let result =
      hasIntersection(
        unzip_result(
          meta.map((m) => metaArgumentGetCompatibleMappings(mapping, m.premise, m.proof))
        )
      );
    return ok(result) ? make_ok() : result;
  } else {
    return ok(mapping) ? make_ok() : mapping;
  }
  assert.fail();
};

const checkArgument = (argument_name, premises, conclusion) => {
  if (argument_name in Arguments) {
    for (let argument of Arguments[argument_name]) {
      if (ok(checkSingleArgument(argument, premises, conclusion))) {
        return make_ok();
      }
    }
  }
  return make_err(Errors.ArgumentDoesNotMatch);
};

module.exports.matchSentence = matchSentence;
module.exports.checkArgument = checkArgument;
