'use strict'

const transcribe = require('./transcribe.js');

test.each([
  ["!(p&q) -> (!p|!q)", "¬(p∧q) → (¬p∨¬q)"],
  ["!(p&q) <-> (!p|!q)", "¬(p∧q) ↔ (¬p∨¬q)"]
])('transcribeOperators', (source, expected) => {
  expect(transcribe.transcribeOperators(source)).toBe(expected);
});
