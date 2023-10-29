// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { connectDatabase, closeDatabase } = require('./database.js');
const { createReport } = require('./analytics.js');
const fs = require('fs');
const path = require('path');
const { make_result, match_result } = require('okljs');

const report_dir = 'analytics/report';

async function writeReport() {
  await connectDatabase();
  let report = await createReport();
  let now = new Date();
  let timestamp = now.toISOString().replace(/[:.-]/g, '');
  fs.mkdirSync(report_dir, { recursive : true });
  fs.writeFileSync(path.join(report_dir, timestamp), JSON.stringify(report, null, 2));
  await closeDatabase();
}

async function main() {
  match_result(await make_result(writeReport()),
    (ok) => process.exit(0),
    (err) => process.exit(1)
  );
}

main();
