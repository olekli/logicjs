// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { getCollection } = require('./database.js');
const { match_result, make_result, get_ok, make_ok, make_err } = require('okljs');

const Roles = {
  user: 'user',
  admin: 'admin'
};

const getUser = (id) =>
  make_result(getCollection('users').findOne({ id: id }));

const userSeen = async (id) =>
  match_result(await getUser(id),
    (user) => (user === null)
      ? make_result(getCollection('users').insertOne({ id: id, role: Roles.user }))
      : make_ok()
  );

const makeAdmin = async (id) =>
  match_result(
    await make_result(
      getCollection('users').updateOne({ id: id }, { $set: { role: Roles.admin } })
    ),
    (ok) => ok.matchedCount === 0 ? make_err() : ok
  );

module.exports.Roles = Roles;
module.exports.getUser = getUser;
module.exports.userSeen = userSeen;
module.exports.makeAdmin = makeAdmin;
