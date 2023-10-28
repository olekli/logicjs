// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { generateKeyPairSync, createHash } = require("crypto");
const jwt = require("jsonwebtoken");
const { make_result, match_result, get_ok, make_ok } = require('okljs');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const { config } = require('./config.js');
const path = require('path');
const { userSeen, getUser, Roles } = require('./user.js');

const key_pair = generateKeyPairSync("rsa", { modulusLength: 4096 });

const lifetime = 1000 * 60 * 60 * 24 * 7;

const makeId = (type, input_id) => {
  let hasher = createHash('sha256');
  hasher.update(type + input_id);
  return hasher.digest('hex');
};

const makeAuthToken = (id) =>
  jwt.sign(
    { id: id },
    key_pair.privateKey,
    {
      algorithm: "RS256",
      expiresIn: lifetime
    }
  );

const decodeAuthToken = async (token) => {
  let decoded = await make_result(util.promisify(jwt.verify)(
    token,
    key_pair.publicKey,
    { algorithms: [ "RS256" ] }
  ));
  return get_ok(match_result(decoded,
    (decoded) => {
      if ('id' in decoded) {
        return decoded.id;
      } else {
        return null;
      }
    },
    (err) => {
      return make_ok(null);
    }
  ));
};

const setResCookie = (res, token) => {
  res.cookie(
    'logicjs_token',
    token,
    {
      httpOnly: true,
      secure: config.is_production,
      sameSite: 'Lax'
    }
  );
};

const getReqCookie = (req) => req.cookies?.logicjs_token;

const clearAllCookies = (req, res) => {
  for (let cookie in req.cookies) {
    res.clearCookie(cookie);
  }
  for (let cookie in req.signedCookies) {
    res.clearCookie(cookie);
  }
}

const retrieveAuth = async (req, res, next) => {
  req.auth = await decodeAuthToken(getReqCookie(req));
  next();
};

const fallbackAnonAuth = (req, res, next) => {
  if (!config.is_production) {
    if (!req.auth) {
      req.auth = makeId('anon', uuidv4());
      setResCookie(res, makeAuthToken(req.auth));
    }
  }
  next();
};

const basicAuth = (req, res, next) => {
  let authHeader = req.headers.authorization;

  res.set('WWW-Authenticate', 'Basic realm="401"');
  if (!authHeader) {
    return res.status(401).send('Unauthorized: No auth header');
  }

  let [type, encodedCredentials] = authHeader.split(' ');

  if (type !== 'Basic') {
    return res.status(401).send('Unauthorized: Incorrect auth type');
  }

  let buff = Buffer.from(encodedCredentials, 'base64');
  let [username, password] = buff.toString('utf-8').split(':');

  // Replace 'admin' and 'password' with your actual username and password
  if (username === config.side_entrance.user && password === config.side_entrance.pw) {
    console.log(`basic auth ${username}`);
    req.auth = makeId('anon', uuidv4());
    setResCookie(res, makeAuthToken(req.auth));
    return res.redirect(path.join(req.baseUrl, 'home'));
  } else {
    return res.status(401).send('Unauthorized: Invalid credentials');
  }
};

const ltiAuth = (req, res, next) => {
  let user = res.locals?.token?.user;
  clearAllCookies(req, res);
  if (user) {
    req.auth = makeId('lti', user);
    setResCookie(res, makeAuthToken(req.auth));
  }
  next();
};

const requireAuth = async (req, res, next) => {
  if (!req.auth) {
    res.redirect(config.no_auth_redirect_url);
  } else {
    match_result(await userSeen(req.auth),
      (ok) => next(),
      (err) => next(err),
    );
  }
};

const requireAdmin = async (req, res, next) =>
  match_result(await getUser(req.auth),
    (user) => {
      if (user.role === Roles.admin) {
        next();
      } else {
        res.redirect(config.no_auth_redirect_url);
      }
    },
    (err) => next(err)
  );

module.exports.makeId = makeId;
module.exports.retrieveAuth = retrieveAuth;
module.exports.fallbackAnonAuth = fallbackAnonAuth;
module.exports.ltiAuth = ltiAuth;
module.exports.basicAuth = basicAuth;
module.exports.requireAuth = requireAuth;
module.exports.requireAdmin = requireAdmin;
