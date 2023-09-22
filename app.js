const express = require('express');
const OpenApiValidator = require('express-openapi-validator');
const pug = require('pug');
const path = require('path');
const { ajv } = require('./validation.js');
const cookieParser = require("cookie-parser");
const { retrieveAuth, fallbackAnonAuth } = require('./auth.js');
const fs = require('fs');
const { getSession } = require('./session.js');
const { match_result } = require('okljs');
const config = require('./config.js');

const getPath = (req, category, filename) =>
  path.join(
    category,
    req.path,
    filename
  );

const getBodySchemaId = (location, method) =>
  path.join(
    '/handler',
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

const validateBody = (location, method, body) => {
  let schema_id = getBodySchemaId(location, method);
  let validateBody = ajv.getSchema(schema_id);
  if (typeof validateBody != 'function') {
    console.error('no such schema:', schema_id);
    return false;
  } else if (!validateBody(body)) {
    console.error('validation failed:', schema_id);
    console.error('received:', body);
    console.error('errors:', validateBody.errors);
    return false;
  } else {
    return true;
  }
};

const locations = [ '/home', '/al_tof', '/al_AmodelsB', '/al_sandbox' ];

const app = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(retrieveAuth);
app.use(fallbackAnonAuth);

app.use((req, res, next) => {
  if (!req.auth) {
    res.redirect(config.no_auth_redirect_url);
  } else {
    next();
  }
});

app.get('/', (req, res, next) => {
  res.redirect(path.join(req.baseUrl, 'home'));
});

app.use((req, res, next) => {
  // validate
  if (req.method === 'GET') {
    if (Object.keys(req.body).length != 0) {
      next('validation error');
    } else if (!locations.includes(req.path)) {
      console.error('no such path:', req.path);
      next('invalid path');
    } else if (!getHandler(req.path, 'get')) {
      next('invalid path');
    } else {
      req.handler = getHandler(req.path, 'get');
      req.session = getSession(req.auth, req.path);
      next();
    }
  } else if (req.method === 'POST') {
    let { dir: location, base: method } = path.parse(req.path);
    if (!locations.includes(location)) {
      next('invalid path');
    } else if (!validateBody(location, method, req.body)) {
      next('validation error');
    } else if (!getHandler(location, method)) {
      next('invalid path');
    } else {
      req.handler = getHandler(location, method);
      req.session = getSession(req.auth, location);
      next();
    }
  } else {
    next('invalid method');
  }
});

app.use((req, res, next) => {
  if (req.method === 'GET') {
    match_result(req.handler(req.session),
      (view) => {
        req.view = view;
        next();
      },
      (err) => { next(err); }
    );
  } else if (req.method === 'POST') {
    match_result(req.handler(req.session, req.body),
      (ok) => { next(); },
      (err) => { next(err); }
    );
  } else {
    next('invalid method');
  }
});

app.use((req, res, next) => {
  // POST-redirect-GET
  if (req.method === 'POST') {
    res.redirect(path.join(req.baseUrl, req.path, '..'));
  } else {
    next();
  }
});

app.use((req, res, next) => {
  // Validate view
  let view_path = path.join('/view', req.view?.path);
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
  res.redirect(req.baseUrl);
});

module.exports.app = app;
