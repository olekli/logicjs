'use strict'

module.exports = {
  get: (req, res, next) => {
    req.view = { path: 'home/home', data: {} };
    next();
  }
};
