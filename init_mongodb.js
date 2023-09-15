'use strict'

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const config = require('./config.js');

const main = async () => {
  let db_path = path.join(__dirname, 'mongodb', 'db');
  let log_path = path.join(__dirname, 'mongodb', 'mongod.log');
  fs.mkdirSync(db_path, { recursive: true });
  {
    console.log('creating admin');
    let mongod = spawn('mongod', ['--dbpath', db_path, '--logpath', log_path]);
    await mongod.on('spawn', async () => {
      let client = new MongoClient(
        config.mongodb.url,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      await client.connect();

      let adminDb = client.db('admin');
      await adminDb.command({
        createUser: 'admin',
        pwd: config.mongodb.admin_pw,
        roles: [
          {
            role: 'userAdminAnyDatabase',
            db: 'admin'
          }
        ],
      });

      let exited = new Promise((resolve) => mongod.on('exit', resolve));
      mongod.kill('SIGTERM');
      await exited;
    });
    console.log('created admin');
  }

  {
    console.log('creating user');
    let mongod = spawn('mongod', ['--dbpath', db_path, '--auth', '--logpath', log_path]);
    await mongod.on('spawn', async () => {
      let client = new MongoClient(
        config.mongodb.url,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      await client.connect();

      const newDb = client.db(config.lti.mongodb.db);

      // Create new user for the new database
      await newDb.command({
        createUser: config.lti.mongodb.user,
        pwd: config.lti.mongodb.user_pw,
        roles: [
          {
            role: 'readWrite',
            db: config.lti.mongodb.db
          }
        ]
      });

      let exited = new Promise((resolve) => mongod.on('exit', resolve));
      mongod.kill('SIGTERM');
      await exited;
    });
  }
};

main();
