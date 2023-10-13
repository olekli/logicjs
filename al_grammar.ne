S -> S_ {% ([s]) => s %}
  | Equivalent {% ([s]) => s %}
  | Follows {% ([s]) => s %}
  | And {% ([s]) => s %}
  | Or {% ([s]) => s %}

S_ -> Atomic {% ([s]) => s %}
  | "(" _ Equivalent _ ")" {% ([,, s]) => s %}
  | "(" _ Follows _ ")" {% ([,, s]) => s %}
  | "(" _ And _ ")" {% ([,, s]) => s %}
  | "(" _ Or _ ")" {% ([,, s]) => s %}
  | Not {% ([s]) => s %}

Atomic -> [a-zA-Z] {% ([v]) => ({letter: v}) %}
Equivalent -> S_ _ "<->" _ S_ {% ([lhs, , , , rhs]) => ({operator: 'equivalent', lhs: lhs, rhs: rhs}) %}
Follows -> S_ _ "->" _ S_ {% ([lhs, , , , rhs]) => ({operator: 'follows', lhs: lhs, rhs: rhs}) %}
And -> S_ _ "&" _ S_ {% ([lhs, , , , rhs]) => ({operator: 'and', lhs: lhs, rhs: rhs}) %}
Or -> S_ _ "|" _ S_ {% ([lhs, , , , rhs]) => ({operator: 'or', lhs: lhs, rhs: rhs}) %}
Not -> "!" _ S_ {% ([ , , s]) => ({operator: 'not', operand: s}) %}

_ -> " " _ {% null %}
  | null
