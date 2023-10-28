// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { MongoMemoryServer } = require('mongodb-memory-server');
const { initAdmin, initDatabase, getCollection, connectDatabase, closeDatabase } = require('./database.js');
const { setConfig } = require('./config.js');
const { Roles, userSeen, getUser, makeAdmin } = require('./user.js');
const { make_ok, make_err, get_ok, get_err, ok, err, useJestResultMatcher } = require('okljs');
useJestResultMatcher();

let mongo_server = null;

beforeAll(async () => {
  mongo_server = await MongoMemoryServer.create();
  let mongo_uri = mongo_server.getUri();
  setConfig({
    mongodb: {
      url: mongo_uri,
      passwords: {
        admin: "admin_pw",
        lti: "lti_pw",
        main: "main_pw"
      }
    }
  });
  await initAdmin();
  await initDatabase('main');
  await connectDatabase();
});

test('userSeen creates new user with user role', async () => {
  let id = 'user 1';
  {
    let result = await getUser(id);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(null);
  }

  {
    let result = await userSeen(id);
    expect(result).toBeOk();
  }

  {
    let result = await getUser(id);
    expect(result).toBeOk();
    expect(get_ok(result)).toMatchObject({ id: id, role: Roles.user });
  }
});

test('getUser returns null for non-existing user', async () => {
  let id = 'user 2';
  {
    let result = await getUser(id);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(null);
  }
});

test('makeAdmin elevates user to admin', async () => {
  let id = 'user 3';
  {
    let result = await getUser(id);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(null);
  }

  {
    let result = await userSeen(id);
    expect(result).toBeOk();
  }

  {
    let result = await getUser(id);
    expect(result).toBeOk();
    expect(get_ok(result)).toMatchObject({ id: id, role: Roles.user });
  }

  {
    let result = await makeAdmin(id);
    expect(result).toBeOk();
  }

  {
    let result = await getUser(id);
    expect(result).toBeOk();
    expect(get_ok(result)).toMatchObject({ id: id, role: Roles.admin });
  }
});

test('makeAdmin fails on non-existing user', async () => {
  let id = 'user 4';
  {
    let result = await getUser(id);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(null);
  }

  {
    let result = await makeAdmin(id);
    expect(result).toBeErr();
  }
});

afterAll(async () => {
  await closeDatabase();
  await mongo_server.stop();
});
