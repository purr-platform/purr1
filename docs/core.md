# Core IR

The Core IR is a graph-based IR in CPS form that holds the canonical form of Purr programs, and is used as a compilation-target for all Purr languages.

Core is eager, has a well-defined ordering (which makes lazy programs harder to compile), uses labelled arguments instead of positional ones, and contains a functional, an object-oriented, and an effect language.

Each node in the graph has an unique identifier, which allow the graph to be serialised, changed, loaded, and versioned without problems. Core does not use _variable names_, and has no notion of scoping. This is similar to the Thorin IR.

## Core semantics

The Core language is defined as follows:

```
value ::= integer | decimal | string | boolean | float
expr ::=
  ;; Functional language
  if e_1 then e_2 else e_3                    Conditional
| e_0(l_1 = v_1, ..., l_n = v_n)              Application
| match e with p_1, ..., p_n                  Pattern matching
| value
| x

  ;; Object language
| e_0.l_0(l_1 = e_1, ..., l_n = e_n)          Message send
| self                                        Current module

  ;; Effect language
| e_1; e_2                                    Sequencing
| perform e                                   Performing effects
| handle e with p_1, ..., p_n                 Trapping effects
```
