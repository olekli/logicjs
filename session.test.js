// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { getSession, cleanupSessions } = require('./session.js');

const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

test('getSession different auth same item returns different object', () => {
  {
    let session = getSession('auth_1', 'item_1');
    session.value = 123;
  }

  {
    let session = getSession('auth_2', 'item_1');
    expect(session.value).toBeUndefined();
  }
});

test('getSession same auth different item returns different object', () => {
  {
    let session = getSession('auth_1', 'item_1');
    session.value = 123;
  }

  {
    let session = getSession('auth_1', 'item_2');
    expect(session.value).toBeUndefined();
  }
});

test('getSession same auth same item returns same object', () => {
  {
    let session = getSession('auth_1', 'item_1');
    session.value = 123;
  }

  {
    let session = getSession('auth_1', 'item_1');
    expect(session.value).toEqual(123);
  }
});

test('cleanupSession keeps sessions within lifetime', () => {
  {
    let session = getSession('auth_1', 'item_1');
    session.value = 1;
  }

  {
    let session = getSession('auth_1', 'item_2');
    session.value = 2;
  }

  {
    let session = getSession('auth_2', 'item_1');
    session.value = 3;
  }

  cleanupSessions(1000);

  expect(getSession('auth_1', 'item_1').value).toEqual(1);
  expect(getSession('auth_1', 'item_2').value).toEqual(2);
  expect(getSession('auth_2', 'item_1').value).toEqual(3);
});

test('getSession refreshes lifetime', async () => {
  {
    let session = getSession('auth_1', 'item_1');
    session.value = 1;
  }

  {
    let session = getSession('auth_1', 'item_2');
    session.value = 2;
  }

  await delay(10);

  {
    let session = getSession('auth_2', 'item_1');
    session.value = 3;
  }

  getSession('auth_1', 'item_1');

  cleanupSessions(3);

  expect(getSession('auth_1', 'item_1').value).toEqual(1);
  expect(getSession('auth_1', 'item_2').value).toEqual(2);
  expect(getSession('auth_2', 'item_1').value).toEqual(3);
});

test('cleanupSessions removes sessions after lifetime', async () => {
  {
    let session = getSession('auth_1', 'item_1');
    session.value = 1;
  }

  {
    let session = getSession('auth_2', 'item_2');
    session.value = 2;
  }

  await delay(10);

  {
    let session = getSession('auth_3', 'item_1');
    session.value = 3;
  }

  getSession('auth_1', 'item_1');

  cleanupSessions(3);

  expect(getSession('auth_1', 'item_1').value).toEqual(1);
  expect(getSession('auth_2', 'item_2').value).toBeUndefined();
  expect(getSession('auth_3', 'item_1').value).toEqual(3);
});
