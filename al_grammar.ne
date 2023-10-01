S -> [a-zA-Z] {% ([v]) => ({letter: v}) %}
  | "(" _ S_ _ "<->" _ S_ _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'equivalent', lhs: lhs, rhs: rhs}) %}
  | S_ _ "<->" _ S_ {% ([lhs, , , , rhs]) => ({operator: 'equivalent', lhs: lhs, rhs: rhs}) %}
  | "(" _ S_ _ "->" _ S_ _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'follows', lhs: lhs, rhs: rhs}) %}
  | S_ _ "->" _ S_ {% ([lhs, , , , rhs]) => ({operator: 'follows', lhs: lhs, rhs: rhs}) %}
  | "(" _ S_ _ "&" _ S_ _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'and', lhs: lhs, rhs: rhs}) %}
  | S_ _ "&" _ S_ {% ([lhs, , , , rhs]) => ({operator: 'and', lhs: lhs, rhs: rhs}) %}
  | "(" _ S_ _ "|" _ S_ _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'or', lhs: lhs, rhs: rhs}) %}
  | S_ _ "|" _ S_ {% ([lhs, , , , rhs]) => ({operator: 'or', lhs: lhs, rhs: rhs}) %}
  | "!" _ S_ {% ([ , , s]) => ({operator: 'not', operand: s}) %}

S_ -> [a-zA-Z] {% ([v]) => ({letter: v}) %}
  | "(" _ S_ _ "<->" _ S_ _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'equivalent', lhs: lhs, rhs: rhs}) %}
  | "(" _ S_ _ "->" _ S_ _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'follows', lhs: lhs, rhs: rhs}) %}
  | "(" _ S_ _ "&" _ S_ _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'and', lhs: lhs, rhs: rhs}) %}
  | "(" _ S_ _ "|" _ S_ _ ")" {% ([ , , lhs, , , , rhs]) => ({operator: 'or', lhs: lhs, rhs: rhs}) %}
  | "!" _ S_ {% ([ , , s]) => ({operator: 'not', operand: s}) %}

_ -> " " _ {% null %}
  | null
