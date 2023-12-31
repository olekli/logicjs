// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const htmlToLines = (raw) => {
  const regex = /<p>.*?<\/p>/g;
  let result = raw.match(regex) || [];
  return result.map((line) =>
    line.replace(/(<([^>]+)>)/ig, '')
  ).map((line) =>
    line.replace(/\&[^;]*;/ig, '')
  ).filter((line) => line != '');
};

const linesToHtml = (lines, highlight = null) => {
  let result = '';
  for (let i = 0; i < lines.length; i++) {
    if (highlight != null && i === highlight) {
      result += `<p style="color:red;">${lines[i]}</p>`;
    } else {
      result += `<p>${lines[i]}</p>`;
    }
  }
  return result;
}

module.exports.htmlToLines = htmlToLines;
module.exports.linesToHtml = linesToHtml;
