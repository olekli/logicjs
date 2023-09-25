'use strict'

const { ok, err, get_err, make_ok, make_err } = require('okljs');

const get = (session) => {
  return { path: 'al_sandbox/instructions/main', data: {} };
};

module.exports.get = get;
