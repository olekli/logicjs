'use strict'

const { htmlToLines, linesToHtml } = require('./html_to_lines.js');

test.each([
  [ '<p>line 1</p><p>line 2</p><p>line 3</p>' ]
])('splits lines correctly', (raw) => {
  let result = htmlToLines(raw);
  expect(result).toEqual([
    'line 1',
    'line 2',
    'line 3'
  ]);
});

test.each([
  [ '<p>line <b>1</b></p><p>line <i>2</i></p><p>line 3</p>' ]
])('removes HTML', (raw) => {
  let result = htmlToLines(raw);
  expect(result).toEqual([
    'line 1',
    'line 2',
    'line 3'
  ]);
});

test.each([
  [ '<p>line 1</p><p>line 2</p><p>line 3</p>' ]
])('linesToHtml(htmlToLines) is invariant', (raw) => {
  expect(linesToHtml(htmlToLines(raw))).toEqual(raw);
});
