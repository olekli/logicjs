// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { MongoMemoryServer } = require('mongodb-memory-server');
const { initAdmin, initDatabase, getCollection, connectDatabase, closeDatabase } = require('./database.js');
const { setConfig } = require('./config.js');
const { userSeen } = require('./user.js');
const { getNumUsersSeen, incCounter, getCounter, createReport } = require('./analytics.js');
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

afterAll(async () => {
  await closeDatabase();
  await mongo_server.stop();
});

test('getNumUsersSeen work correctly', async () => {
  {
    let result = await getNumUsersSeen();
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(0);
  }

  await userSeen('user 1');
  await userSeen('user 2');
  await userSeen('user 3');
  await userSeen('user 1');
  await userSeen('user 2');
  await userSeen('user 3');

  {
    let result = await getNumUsersSeen();
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(3);
  }
});

test.each([
  [ 'test 1 type 1', 'counter 1', 'mode 1' ],
  [ 'test 1 type 2', 'counter 1', 'mode 1' ],
  [ 'test 1 type 1', 'counter 2', 'mode 1' ],
  [ 'test 1 type 1', 'counter 1', 'mode 2' ],
  [ 'test 1 type 2', 'counter 1', 'mode 4' ],
  [ 'test 1 type 1', 'counter 1', 'mode 1' ],
  [ 'test 1 type 2', 'counter 1', 'mode 1' ],
  [ 'test 1 type 1', 'counter 2', 'mode 1' ],
  [ 'test 1 type 1', 'counter 1', 'mode 2' ],
  [ 'test 1 type 2', 'counter 1', 'mode 4' ],
  [ 'test 1 type 2', 'counter 1.sub 1', 'mode 4' ],
  [ 'test 1 type 2', 'counter 1.sub 2', 'mode 4' ],
])('counters are initialised to 0', async (type, counter, mode) => {
  let result = await getCounter(type, `${counter}.${mode}`);
  expect(result).toBeOk();
  expect(get_ok(result)).toEqual(0);
});

test.each([
  [ 'test 2 type 1', 'counter 1', 'mode 1' ],
  [ 'test 2 type 2', 'counter 1', 'mode 1' ],
  [ 'test 2 type 1', 'counter 2', 'mode 1' ],
  [ 'test 2 type 1', 'counter 1', 'mode 2' ],
  [ 'test 2 type 2', 'counter 1', 'mode 4' ],
])('incrementing new counters initialises to 1', async (type, counter, mode) => {
  {
    let result = await incCounter(type, `${counter}.${mode}`);
    expect(result).toBeOk();
  }

  {
    let result = await getCounter(type, `${counter}.${mode}`);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(1);
  }
});

test.each([
  [ 'test 3 type 1', 'counter 1', 'mode 1', true, 1 ],
  [ 'test 3 type 2', 'counter 1', 'mode 1', true, 1 ],
  [ 'test 3 type 1', 'counter 2', 'mode 1', true, 1 ],
  [ 'test 3 type 1', 'counter 1', 'mode 2', true, 1 ],
  [ 'test 3 type 2', 'counter 1', 'mode 4', true, 1 ],
  [ 'test 3 type 1', 'counter 1', 'mode 1', true, 2 ],
  [ 'test 3 type 2', 'counter 1', 'mode 1', true, 2 ],
  [ 'test 3 type 1', 'counter 2', 'mode 1', true, 2 ],
  [ 'test 3 type 1', 'counter 1', 'mode 2', true, 2 ],
  [ 'test 3 type 2', 'counter 1', 'mode 4', true, 2 ],
  [ 'test 3 type 1', 'counter 1', 'mode 1', true, 3 ],
  [ 'test 3 type 2', 'counter 1', 'mode 1', false, 2 ],
  [ 'test 3 type 1', 'counter 2', 'mode 1', false, 2 ],
  [ 'test 3 type 1', 'counter 1', 'mode 2', false, 2 ],
  [ 'test 3 type 2', 'counter 1', 'mode 4', false, 2 ],
  [ 'test 3 type 1', 'counter 1', 'mode 1', false, 3 ],
  [ 'test 3 type 2', 'counter 1', 'mode 1', true, 3 ],
  [ 'test 3 type 1', 'counter 2', 'mode 1', true, 3 ],
  [ 'test 3 type 1', 'counter 2', 'mode 1', true, 4 ],
  [ 'test 3 type 1', 'counter 2', 'mode 1', true, 5 ],
  [ 'test 3 type 1', 'counter 1', 'mode 2', true, 3 ],
  [ 'test 3 type 2', 'counter 1', 'mode 4', true, 3 ],
])('counters increment correctly', async (type, counter, mode, do_inc, expected) => {
  if (do_inc) {
    let result = await incCounter(type, `${counter}.${mode}`);
    expect(result).toBeOk();
  }

  {
    let result = await getCounter(type, `${counter}.${mode}`);
    expect(result).toBeOk();
    expect(get_ok(result)).toEqual(expected);
  }
});

test('createReport', async () => {
  console.log(JSON.stringify(await createReport(), null, 2));
});
