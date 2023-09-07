const express = require('express');
const OpenApiValidator = require('express-openapi-validator');
const pug = require('pug');
const path = require('path');
const { ajv } = require('./validation.js');
const cookieParser = require("cookie-parser");
const { retrieveAuth, fallbackAnonAuth } = require('./auth.js');
const fs = require('fs');

const getPath = (req, category, filename) =>
  path.join(
    category,
    req.path,
    filename
  );

const getBodySchemaId = (location, method) =>
  path.join(
    'handler',
    location,
    `post-${method}`
  );

const getHandlerPath = (location) =>
  path.join(
    __dirname,
    'handler',
    location,
    'handler.js'
  );

const fileExists = (path) => {
  let result;
  try {
    fs.accessSync(path);
    result = true;
  } catch(error) {
    result = false;
  }
  return result;
};

const getHandler = (location, method) => {
  let handler_path = getHandlerPath(location);
  if (fileExists(handler_path)) {
    let handler_module = require(handler_path);
    if (method in handler_module) {
      return handler_module[method];
    }
  }
  return null;
};

const locations = [ '/home', '/al_tof' ];

const app = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(retrieveAuth);
app.use(fallbackAnonAuth);

app.use((req, res, next) => {
  if (!req.auth) {
    next('auth missing');
  } else {
    next();
  }
});

app.use((req, res, next) => {
  if (req.method === 'GET') {
    if (Object.keys(req.body).length != 0) {
      next('validation error');
    } else if (!locations.includes(req.path)) {
      console.error('no such path:', req.path);
      next('invalid path');
    } else {
      let handler = getHandler(req.path, 'get');
      if (handler) {
        handler(req, res, next);
      } else {
        next('invalid path');
      }
    }
  } else if (req.method === 'POST') {
    let { dir: location, base: method } = path.parse(req.path);
    if (!locations.includes(location)) {
      next('invalid path');
    } else {
      let schema_id = getBodySchemaId(location, method);
      let validateBody = ajv.getSchema(schema_id);
      if (typeof validateBody != 'function') {
        console.error('no such schema:', schema_id);
        next('validation error');
      } else if (!validateBody(req.body)) {
        console.error('validation failed:', getBodySchemaId(req));
        console.error('received:', req.body);
        console.error('errors:', validateBody.errors);
        next('validation error');
      } else {
        let handler = getHandler(location, method);
        if (handler) {
          handler(req, res, next);
        } else {
          next('invalid path');
        }
      }
    }
  } else {
    next('invalid method');
  }
});

app.use((req, res, next) => {
  // Validate view
  let view_path = path.join('view', req.view?.path);
  let validateView = ajv.getSchema(view_path);
  if (!req.view?.data || !validateView(req.view.data)) {
    console.error(
      `Failed validation of view ${view_path}: ${JSON.stringify(req.view?.data, null, 2)}`
    );
    console.error(validateView.errors);
    next('validation error');
  } else {
    next();
  }
});

app.use((req, res, next) => {
  // Render view
  let file_path = path.join('.', 'view', req.view.path) + '.pug';
  if (fileExists(file_path)) {
    res.send(
      pug.renderFile(
        file_path,
        req.view.data
      ));
  } else {
    console.error(file_path);
    next('no such view');
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Error');
});

module.exports.app = app;
