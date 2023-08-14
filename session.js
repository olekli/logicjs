'use strict'

const sessions = {};

const getSession = (auth, item) => {
  if (!sessions[auth]) {
    sessions[auth] = {};
  }
  sessions[auth].last_used = Date.now();
  if (!sessions[auth][item]) {
    sessions[auth][item] = {};
  }
  return sessions[auth][item];
};

const cleanupSessions = (lifetime = 1000 * 60 * 60) => {
  let t1 = Date.now();
  for (let key of Object.keys(sessions)) {
    if ((t1 - sessions[key].last_used) > lifetime) {
      delete sessions[key];
    }
  }
};

module.exports.getSession = getSession;
module.exports.cleanupSessions = cleanupSessions;
