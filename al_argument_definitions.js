'use strict'

const Arguments = require('./al_argument_definitions.json');
const { parse } = require('./al_parse.js');
const { ajv } = require('./validation.js');

for (let argument_list in Arguments) {
  for (let argument of Arguments[argument_list]) {
    argument.premises = argument.premises.map((s) => parse(s));
    argument.conclusion = parse(argument.conclusion);
  }
}

let validate = ajv.getSchema('/type/Arguments');
if (!validate(Arguments)) {
  assert.fail(() => `${JSON.stringify(validate.errors, null, 2)}`);
}

module.exports.Arguments = Arguments;
