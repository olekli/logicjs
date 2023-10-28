// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const mockUser = {
  userSeen: jest.fn()
};
jest.mock('./user.js', () => mockUser);

beforeEach(() => {
  mockUser.userSeen.mockClear();
});

const { retrieveAuth, fallbackAnonAuth, requireAuth } = require('./auth.js');
const { setConfig } = require('./config.js');
const { make_ok, make_err } = require('okljs');

setConfig({ no_auth_redirect_url: 'redirect_url' });

class ResMock {
  cookies = {};

  cookie(name, content, options) {
    this.cookies[name] = content;
  }

  redirect = jest.fn();
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

test('requireAuth redirects on no auth', async () => {
  {
    let req = { auth: null };
    let res = new ResMock();
    let next = jest.fn();

    await requireAuth(req, res, next);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('redirect_url');
  }
});

test('requireAuth sees user on auth', async () => {
  {
    let id = 'user 1';
    let req = { auth: id };
    let res = new ResMock();
    let next = jest.fn();
    mockUser.userSeen.mockResolvedValue(make_ok());

    await requireAuth(req, res, next);
    expect(res.redirect).toHaveBeenCalledTimes(0);
    expect(mockUser.userSeen).toHaveBeenCalledTimes(1);
    expect(mockUser.userSeen).toHaveBeenCalledWith(id);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  }
});

test('requireAuth fails when database fails', async () => {
  {
    let id = 'user 1';
    let error = 'db failed';
    let req = { auth: id };
    let res = new ResMock();
    let next = jest.fn();
    mockUser.userSeen.mockResolvedValue(make_err(error));

    await requireAuth(req, res, next);
    expect(res.redirect).toHaveBeenCalledTimes(0);
    expect(mockUser.userSeen).toHaveBeenCalledTimes(1);
    expect(mockUser.userSeen).toHaveBeenCalledWith(id);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  }
});
