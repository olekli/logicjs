// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { ok, err, get_err, make_ok, make_err } = require('okljs');

const get = (session) => {
  return make_ok({ path: 'al_proofs/instructions/main', data: {} });
};

module.exports.get = get;
