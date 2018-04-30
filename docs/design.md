# Purr's Design

As a platform:

- Modules describe in which language they're written;
- Modules may provide a language implementation;
- Language implementations compile to Core (using AST objects directly);
- Core has two backends: CoreVM, a live VM with a JIT; and Core2JS, an optimising AOT compiler with PGO.
- IDE uses CoreVM as a service (CoreVM allows hot-patching and querying runtime information);

## (maybe) surprising design decisions

**No reflection**. If you're familiar with Smalltalk and Lisp environments, "no reflection" may be a bit odd.
Purr *does* have reflection (mirror-based), but only as a part of the IDE service. IDE/VM plugins can query
and modify live runtime information. This is a VM-specific format, which is not exactly Core semantics.
Reflection (and other stuff) are gated through OCS.

For meta-programming, instead of reflection, people just write whole new programming languages. So they must
write at least a parser and compiler (though those can be an extension of an existing language, details are
still not decided on this yet).
