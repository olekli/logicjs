@include "./al_grammar.ne"

line -> separator_line {% ([x]) => x %}
  | sentence_line {% ([x]) => x %}

separator_line -> bars " ":* "-" {% ([depth, , ]) => ({ type: "separator", depth: depth }) %}

sentence_line -> bars " ":* integer " ":+ S " ":+ argument {% ([depth, , line_number, , sentence, , argument]) => ({ type: "sentence", depth: depth, line_number: line_number - 1, sentence: sentence, argument: argument }) %}

bars -> "|":+ {% ([bars]) => (bars.length) %}

argument -> tautology {% ([x]) => x %}
  | object_argument {% ([x]) => x %}
  | meta_argument {% ([x]) => x %}

tautology -> argument_name {% ([argument_name]) => ({ name: argument_name, type: "object", premises_lines: [] }) %}

object_argument -> argument_name "(" _ integer (_ "," _ integer):* _ ")" {% (d) => ({ name: d[0], type: "object", premises_lines: [d[3] - 1, ...(d[4].map(i => (i[3] - 1)))] }) %}

meta_argument -> argument_name "(" _ integer _ "-" _ integer _ ")" {% (d) => ({ name: d[0], type: "meta", premises_lines: [d[3] - 1, d[7] - 1] }) %}

argument_name -> [A-ZÄ\+\-]:+ {% (d) => d[0].join('') %}

integer -> [0-9]:+ {% (d) => parseInt(d[0].join(''), 10) %}
