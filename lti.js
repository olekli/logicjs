// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

const express = require('express');
const lti = require('ltijs').Provider;
const { ltiAuth } = require('./auth.js');
const path = require('path');
const { config } = require('./config.js');
const { initDatabase } = require('./database.js');

const deployLti = async () => {
  await initDatabase('lti');

  lti.setup(
    config.lti.ltikey,
    {
      url: config.mongodb.url + 'logicjs_lti',
      connection: { user: 'logicjs_lti', pass: config.mongodb.passwords['lti'] }
    },
    {
      appRoute: '/app',
      loginRoute: '/login',
      sessionTimeoutRoute: '/sessionTimeout',
      invalidTokenRoute: '/invalidToken',
      keysetRoute: '/keys',

      cookies: {
        secure: true,
        sameSite: 'None'
      }
    }
  );

  lti.app.use(lti.appRoute(), ltiAuth);
  lti.app.use(lti.appRoute(), (req, res, next) => {
    res.redirect('/logicjs/app/home');
  });

  await lti.deploy({ serverless: true });
  await lti.registerPlatform(config.lti.platform)

  return lti;
}

module.exports.deployLti = deployLti;
