const express = require('express');
const lti = require('ltijs').Provider;
const { ltiAuth } = require('./auth.js');
const path = require('path');
const config = require('./config.js');

const deployLti = async () => {
  lti.setup(
    config.lti.ltikey,
    {
      url: config.mongodb.url + config.lti.mongodb.db,
      connection: { user: config.lti.mongodb.user, pass: config.lti.mongodb.user_pw }
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
