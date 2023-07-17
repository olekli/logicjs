S -> [p-r] {% ([v]) => ({letter: v}) %}
  | "(" _ S _ "->" _ S _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'follows', lhs: lhs, rhs: rhs}) %}
  | "!" _ S {% ([ , , s]) => ({operator: 'not', operand: s}) %}

_ -> " " _ {% null %}
  | null
