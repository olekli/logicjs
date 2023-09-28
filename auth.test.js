// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { retrieveAuth, fallbackAnonAuth } = require('./auth.js');

class ResMock {
  cookies = {};

  cookie(name, content, options) {
    this.cookies[name] = content;
  }
};

test('retrieveAuth contains NULL auth when no cookie present', async () => {
  let req = {};
  let res = new ResMock();
  let next = jest.fn();

  await retrieveAuth(req, res, next);

  expect(req.auth).toBeNull();

  expect(res.cookies).toEqual({});

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith();
});

test('fallbackAnonAuth sets auth and cookie', () => {
  let req = { auth: null };
  let res = new ResMock();
  let next = jest.fn();

  fallbackAnonAuth(req, res, next);

  expect(typeof req.auth).toEqual('string');
  expect(req.auth).not.toEqual('');

  expect(typeof res.cookies.logicjs_token).toEqual('string');
  expect(res.cookies.logicjs_token).not.toEqual('');

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith();
});

test('retrieveAuth works after fallbackAnonAuth', async () => {
  let cookie = '';
  let expected_auth = '';

  {
    let req = { auth: null };
    let res = new ResMock();
    let next = jest.fn();

    fallbackAnonAuth(req, res, next);
    cookie = res.cookies.logicjs_token;
    expected_auth = req.auth;
  }

  {
    let req = { auth: null, cookies: { logicjs_token: cookie } };
    let res = new ResMock();
    let next = jest.fn();

    await retrieveAuth(req, res, next);
    expect(typeof req.auth).toEqual('string');
    expect(req.auth).not.toEqual('');
    expect(req.auth).toEqual(expected_auth);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  }
});

test('fallbackAnonAuth creates unique', async () => {
  let auth_1 = '';
  let auth_2 = '';

  {
    let req = { auth: null };
    let res = new ResMock();
    let next = jest.fn();

    fallbackAnonAuth(req, res, next);
    auth_1 = req.auth;
  }

  {
    let req = { auth: null };
    let res = new ResMock();
    let next = jest.fn();

    fallbackAnonAuth(req, res, next);
    auth_2 = req.auth;
  }

  expect(auth_1).not.toEqual(auth_2);
});
