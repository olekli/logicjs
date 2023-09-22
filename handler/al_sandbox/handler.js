'use strict'

const { make_ok, make_err } = require('okljs');

const get = (session) => {
  let raw = (session.raw != undefined) ? session.raw : '';
  return { path: 'al_sandbox/main', data: { raw: raw } };
};

const check = (session, args) => {
  session.raw = args.raw;
  return make_ok();
}

module.exports.get = get;
module.exports.check = check;
