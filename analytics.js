// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { getCollection } = require('./database.js');
const { make_result, match_result } = require('okljs');

const getNumUsersSeen = () => make_result(getCollection('users').countDocuments({}));

const incCounter = async (type, name) =>
  match_result(await initCounter(type, name),
    async (ok) => {
      let filter = { [`${type}`]: { $exists: true } };
      let update = {
        $inc: { [`${type}.${name}`]: 1 }
      };
      let options = { upsert: true };

      return make_result(getCollection('analytics').updateOne(filter, update, options));
    }
  );

const initCounter = (type, name) =>
  make_result((async () => {
    let exists_query = { [`${type}.${name}`]: { $exists: true } };
    let exists_document = await getCollection('analytics').findOne(exists_query);
    if (!exists_document) {
      let filter = { [`${type}`]: { $exists: true } };
      let init_update = { $set: { [`${type}.${name}`]: 0 } };
      let options = { upsert: true };
      await getCollection('analytics').updateOne(filter, init_update, options);
    }
  })());

const getValue = (object, key_string) => {
  let keys = key_string.split('.');

  let current = object;
  for (let key of keys) {
    if (current[key] !== undefined) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
};

const getCounter = async (type, name) =>
  match_result(await initCounter(type, name),
    async (ok) => {
      let query = { [`${type}`]: { $exists: true } };
      let projection = { _id: 0, [`${type}.${name}`]: 1 };
      return match_result(
        await make_result(getCollection('analytics').findOne(query, { projection })),
        (ok) => getValue(ok, `${type}.${name}`)
      );
    }
  );

const createReport = async () => {
  let result = {};
  match_result(await getNumUsersSeen(),
    (num_users) => result.num_users_seen = num_users
  );
  let query = {};
  let projection = { _id: 0 };
  let cursor = getCollection('analytics').find(query, { projection });
  result.analytics = await cursor.toArray();
  return result;
};

module.exports.getNumUsersSeen = getNumUsersSeen;
module.exports.incCounter = incCounter;
module.exports.getCounter = getCounter;
module.exports.createReport = createReport;
