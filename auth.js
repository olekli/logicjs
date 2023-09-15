'use strict'

const { generateKeyPairSync, createHash } = require("crypto");
const jwt = require("jsonwebtoken");
const { make_result, match_result, get_ok, make_ok } = require('okljs');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const config = require('./config.js');

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

const ltiAuth = (req, res, next) => {
  let user = res.locals?.token?.user;
  if (user) {
    req.auth = makeId('lti', user);
    setResCookie(res, makeAuthToken(req.auth));
  }
  next();
};

module.exports.retrieveAuth = retrieveAuth;
module.exports.fallbackAnonAuth = fallbackAnonAuth;
module.exports.ltiAuth = ltiAuth;
