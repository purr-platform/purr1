# Purr Syntax

## Core language

Core is the language that the Purr VM executes, and all languages in the platform compile to.

```
Top: 
  (module <id> <meta ...> <declaration ...>)


Declaration:
  (define <name> <meta> <param:id ...> <expr>)    ;; 2nd class function
  (record <name> <meta> <field:id ...>)           ;; record type
  (union <name> <meta> <variant ...>)             ;; union type
  (annotation <name> <field:id ...>)              ;; annotation type
  (effect <name> <field:id ...>)                  ;; effect type

Meta:
  (<name> <compile-expr ...>)         where <name> is a valid annotation ref

Variant:
  (<name> <field:id ...>)

Expression:
  (invoke <module> <name> <expr ...>)   ;; module-level function application
  (call <expr> <expr ...>)              ;; lambda application

  (if <expr> <expr> <expr>)       ;; Branching
  (let <name> <expr> <expr>)      ;; Aliasing
  
  <integer> | <decimal> | <text> | <bool>     ;; ast literals
  
  self  ;; the current module

  (make-lambda <param:id ...> <expr>)    ;; Lambda introduction
  (make-tuple <expr ...>)                ;; Tuple introduction
  (make-record <module> <name> <field:id ...> <expr ...>)   ;; Record introduction
  (make-variant <module> <name> <variant:id> <expr ...>)    ;; Variant introduction
  
  (load-local <name>)   ;; loads a local variable

  (match <expr> <case ...>)    ;; pattern matching

  (perform <module> <name> <expr ...>)     ;; performs an effect
  (handle <module> <name> (<continuation:id> <effect:id> <expr>) <expr>)  ;; handles an effect

Case:
  (<pattern> <binding:id ...> <expr>)

Pattern:
  (any)                 ;; matches anything
  (equal <literal>)     ;; tests equivalence to literal
  (tuple <arity>)       ;; matches tuple of given arity
  (record <module> <name> <field:id ...>)   ;; matches fields of given record
  (variant <module> <name> <variant:id>)    ;; matches given variant
```


## Surface syntax

Purr's surface syntax is defined as follows:

```
Module:
  module <id> where <declaration ...>

Declaration:
  define <signature> as <expr> end
  union <name> <variant ...> end
  record <name> { <field ...> }
  annotation <signature>
  effect <signature>

Variant:
  case <signature>

Signature:
  <name> <kwpair ...>       # keyword
  <kwpair ...>              # keyword leading
  not <name>                # not
  <name> <operator> <name>  # binary
  <name> <name>             # unary
  <name>                    # nullary

Expression:
  <integer> | <decimal> | <text> | <bool>     # literals

  if <expr> then <expr> else <expr>   # Branching
  let <name> = <expr> in <expr>       # Aliasing
  match <expr> <case ...>             # Pattern matching

  (<param ...>) => <expr>             # Lambda
  [<expr ...>]                        # Tuple
  <qname> { <pair ...> }              # Record
  <qname> "." <sigcall>               # Variant

  <expr> <qname>                      # unary apply
  <qname>                             # nullary apply / variable
  <expr> <qoperator> <expr>           # binary apply
  <q>not <expr>                       # not apply
  <expr> <qkwapply ...>               # keyword apply
  <qkwapply ...>                      # leading keyword apply
  <expr> ( <expr ...> )               # lambda apply

  <expr> |> <expr>  # Pipe

  perform <qname> . <sigcall>             # Effect
  do <expr> handle <effpattern ...> end   # Effect handlers
```