'use strict'

const Ajv = require('ajv');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const ajv = new Ajv({ coerceTypes: "array", useDefaults: true });
const schema_dirs = [ 'view', 'handler' ];

const getFiles = (this_path) => {
  let result = [];
  let ps = fs.readdirSync(this_path);
  for (let p of ps) {
    let full_path = path.join(this_path, p);
    let parsed = path.parse(full_path);
    let stat = fs.statSync(full_path);
    if (stat.isDirectory()) {
      result = result.concat(getFiles(full_path));
    } else if (parsed.ext === '.yaml') {
      result.push(full_path);
    }
  }
  return result;
}

let files = schema_dirs.reduce(
  (result, dir) => result.concat(getFiles(dir)),
  []
);

for (let f of files) {
  let parsed = path.parse(f);
  let id = path.join(parsed.dir, parsed.name);
  let schema = yaml.load(fs.readFileSync(f));
  try {
    ajv.addSchema(schema, id);
  } catch(error) {
    console.error(`Adding schema ${id}: ${JSON.stringify(schema, null, 2)}`);
    throw error;
  }
}

module.exports.ajv = ajv;
