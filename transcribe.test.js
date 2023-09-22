'use strict'

const { transcribeOperators, reverseTranscribeOperators } = require('./transcribe.js');

test.each([
  ["!(p&q) -> (!p|!q)", "¬(p∧q) → (¬p∨¬q)"],
  ["!(p&q) <-> (!p|!q)", "¬(p∧q) ↔ (¬p∨¬q)"]
])('transcribeOperators', (source, expected) => {
  expect(transcribeOperators(source)).toEqual(expected);
});

test.each([
  ["!(p&q) -> (!p|!q)" ],
  ["!(p&q) <-> (!p|!q)" ]
])('reverseTranscribeOperators(transcribeOperators) is invariant', (source) => {
  expect(reverseTranscribeOperators(transcribeOperators(source))).toEqual(source);
});
