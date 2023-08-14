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

const getBodySchemaId = (req) =>
  getPath(req, 'handler', `${req.method.toLowerCase()}-body`);

const getHandlerPath = (req) =>
  path.join(
    __dirname,
    getPath(req, 'handler', `handler.js`)
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
  // Validate body
  let validateBody = ajv.getSchema(getBodySchemaId(req));
  if (typeof validateBody != 'function') {
    console.error('no such schema:', getBodySchemaId(req));
    next('validation error');
  } else if (req.body && !validateBody(req.body)) {
    console.error('validation failed:', getBodySchemaId(req));
    console.error('received:', req.body);
    console.error('errors:', validateBody.errors);
    next('validation error');
  } else {
    next();
  }
});

app.use((req, res, next) => {
  // Call handler
  let handler_path = getHandlerPath(req);
  if (fileExists(handler_path)) {
    let { get, post } = require(handler_path);
    if (req.method === 'GET') {
      get(req, res, next);
    } else if (req.method === 'POST') {
      post(req, res, next);
    } else {
      next('handler error');
    }
  } else {
    console.error('no such handler:', handler_path);
    next('handler error');
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
