// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { createReport } = require('../../../analytics.js');

module.exports = {
  get: async (session) => {
    return {
      path: 'admin/analytics/report',
      data: {
        report: JSON.stringify(await createReport(), null, 2)
      }
    };
  }
};
