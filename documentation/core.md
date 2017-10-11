# Core

An intermediate language for high-level DSLs that can interact with each
other in Purr.


## Modules

Core's main unit is a Module:

```hs
type Module =
  interface :: ID         -- Unique identifier of the interface the module implements
  declarations :: [Decl]
```

## Declarations

Each module contains a set of declarations:

```hs
data Decl =
| Record (Name, [Field])
| Union [(Name, [Field])]
| Method (Signature, Expr)
| Public ([Selector])
| Use (ID, [Selector])
```

## Expressions

Core expressions uses a basic functional language:

```hs
data Expr =
| Bool ...
| Text ...
| Decimal ...
| Integer ...
| Vector ...
| Let (Name, Expr, Expr)
| 
```

