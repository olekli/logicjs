// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { connectDatabase, closeDatabase } = require('./database.js');
const { makeAdmin } = require('./user.js');
const { makeId } = require('./auth.js');
const { match_result } = require('okljs');

async function main() {
  if (typeof process.argv[2] === 'string') {
    console.log('elevating:', process.argv[2]);
    await connectDatabase();
    let result = await makeAdmin(makeId('lti', process.argv[1]));
    match_result(result,
      (ok) => process.exit(0),
      (err) => console.error(err)
    );
  }
  console.error('error');
  process.exit(1);
}

main();
