// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { initAdmin, initDatabase } = require('./database.js');

async function main() {
  await initAdmin();
  await initDatabase('main');
}

main();
