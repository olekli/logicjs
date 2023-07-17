// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "S", "symbols": [/[p-r]/], "postprocess": ([v]) => ({letter: v})},
    {"name": "S$string$1", "symbols": [{"literal":"-"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "S", "symbols": [{"literal":"("}, "_", "S", "_", "S$string$1", "_", "S", "_", {"literal":")"}], "postprocess": ([ , , lhs, , , , rhs]) => ({operator: 'follows', lhs: lhs, rhs: rhs})},
    {"name": "S", "symbols": [{"literal":"!"}, "_", "S"], "postprocess": ([ , , s]) => ({operator: 'not', operand: s})},
    {"name": "_", "symbols": [{"literal":" "}, "_"], "postprocess": null},
    {"name": "_", "symbols": []}
]
  , ParserStart: "S"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
