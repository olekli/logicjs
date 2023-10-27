// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { MongoClient } = require('mongodb');
const config = require('./config.js');

let Client = null;
let Database = null;
let Collections = {};

const initAdmin = async () => {
  let client = new MongoClient(
    config.mongodb.url
  );
  await client.connect();

  const admin_db = client.db('admin');

  try {
    await admin_db.command({
      createUser: 'admin',
      pwd: config.mongodb.passwords['admin'],
      roles: [
        {
          role: 'userAdminAnyDatabase',
          db: 'admin'
        }
      ],
    });
  } catch (error) {
  }

  await client.close();
};

const initDatabase = async (db_name) => {
  let client = new MongoClient(
    config.mongodb.url,
    {
      auth: {
        username: 'admin',
        password: config.mongodb.passwords['admin']
      }
    }
  );
  await client.connect();

  const db = client.db('logicjs_' + db_name);

  const user_info = await db.command({
    usersInfo: { user: 'logicjs_' + db_name, db: 'logicjs_' + db_name },
  });

  if (user_info.users.length === 0)
  {
    await db.command({
      createUser: 'logicjs_' + db_name,
      pwd: config.mongodb.passwords[db_name],
      roles: [
        {
          role: 'readWrite',
          db: 'logicjs_' + db_name
        }
      ]
    });
  }

  await client.close();
};

const connectDatabase = async () => {
  Client = new MongoClient(
    `${config.mongodb.url}logicjs_main`,
    {
      auth: {
        username: 'logicjs_main',
        password: config.mongodb.passwords['main']
      }
    }
  );
  await Client.connect();
  Database = Client.db();
}

const closeDatabase = async () => {
  await Client.close();
};

const getCollection = (collection) => {
  if (Collections[collection] === undefined) {
    Collections[collection] = Database.collection(collection);
  }
  return Collections[collection];
};

module.exports.initAdmin = initAdmin;
module.exports.initDatabase = initDatabase;
module.exports.connectDatabase = connectDatabase;
module.exports.closeDatabase = closeDatabase;
module.exports.getCollection = getCollection;
