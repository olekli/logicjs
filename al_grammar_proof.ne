@include "./al_grammar.ne"

line -> separator_line {% ([x]) => x %}
  | sentence_line {% ([x]) => x %}

separator_line -> bars " ":* "-" {% ([depth, , ]) => ({ type: "separator", depth: depth }) %}

sentence_line -> bars " ":* integer " ":+ S " ":+ argument {% ([depth, , line_number, , sentence, , argument]) => ({ type: "sentence", depth: depth, line_number: line_number - 1, sentence: sentence, argument: argument }) %}

bars -> "|":+ {% ([bars]) => (bars.length) %}

argument -> argument_name premises:? {% ([name, premises]) => ({ name: name, premises: premises != null ? premises : [] }) %}

premises -> "(" _ premise (_ "," _ premise):* _ ")" {% ([ , , x, xs]) => [x, ...(xs.map(i => i[3])) ] %}

premise -> integer {% ([x]) => ({ type: 'object', line: x - 1 }) %}
  | integer _ "-" _ integer {% ([x, , , , y]) => ({ type: 'meta', start_line: x - 1, end_line: y - 1 }) %}

argument_name -> [A-ZÄ\+\-]:+ {% (d) => d[0].join('') %}

integer -> [0-9]:+ {% (d) => parseInt(d[0].join(''), 10) %}
