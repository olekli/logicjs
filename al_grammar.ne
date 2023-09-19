S -> [a-zA-Z] {% ([v]) => ({letter: v}) %}
  | "(" _ S _ "<->" _ S _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'equivalent', lhs: lhs, rhs: rhs}) %}
  | "(" _ S _ "->" _ S _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'follows', lhs: lhs, rhs: rhs}) %}
  | "(" _ S _ "&" _ S _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'and', lhs: lhs, rhs: rhs}) %}
  | "(" _ S _ "|" _ S _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'or', lhs: lhs, rhs: rhs}) %}
  | "!" _ S {% ([ , , s]) => ({operator: 'not', operand: s}) %}

_ -> " " _ {% null %}
  | null
