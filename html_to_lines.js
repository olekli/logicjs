'use strict'

const htmlToLines = (raw) => {
  const regex = /<p>.*?<\/p>/g;
  let result = raw.match(regex) || [];
  return result.map((line) =>
    line.replace(/(<([^>]+)>)/ig, "")
  );
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
