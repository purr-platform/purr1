# Goals and Overview

Purr is a multi-language platform primarily designed for teaching programming. In other words, programs in Purr are meant to be written in multiple programming languages, with each module being able to use the others without overhead regardless of the language they were written in. Furthermore, Purr's design is optimised to the use case of teaching programming.

Here are some of the core goals of Purr:

* Making DSLs a core part of programming, by reducing implementation, interop, and tooling barriers;
* Immediate feedback with a (serialisable) live VM (a la Newspeak);
* Controlling trust levels on thirdy-party code (modules with DI by constraints, and OCS);
* Extensibility (modules + constraint linking);
* Controlled and extensible effects (effect handlers);
* Reducing learning barriers for people who don't speak English (structural IDE with live translation by language annotations);
* Safer programming, with a reduced burden of proofs (OCS, type inference + gradual typing, strong checking, secure information-flow policies?)

## Purr for teaching programming

For teaching programming, Purr follows the ideas of Peter Van Roy and Seif Haridi's [Concepts, Techniques, and Models of Computer Programming](https://www.info.ucl.ac.be/~pvr/book.html). Programming concepts are better understood when people deal with them directly, without the incidental complexities introduced by practical programming languages. In order to do this, students use many "kernel" languages during a course, where each language is designed with the core ideas that would be taught.

For example, if we want to teach object-oriented programming, we can pick a very simple language that has only objects and messaging.

```
x in Variables
n in Integers
s in Strings
b in Booleans

Expr := rcv.labelᵢ(arg): Expr         (object, 0 < i < n)
      | Expr.labelᵢ(Expr)             (message send)
      | x | n | s | b
```

An object-oriented program in this kernel language then could look like this (assuming a minimal standard library):

```
self.open_door(index): (
  describe(): "Door ".concat(index.as_string()).concat(" is open")
)

self.closed_door(index): (
  describe(): "Door ".concat(index.as_string()).concat(" is closed")
)

self.doors():
  1.to(100)
   .map(
     do(index):
       index.sqrt().equals(index.sqrt().round())
            .then(do(): self.open_door(index))
            .else(do(): self.closed_door(index))
   )
   .join("\n")
```

Not the prettiest syntax, sure, but it captures the core ideas of object-oriented programming and exposes them clearly to the students. It's easy to add other ideas (like inheritance, or classes) from object-oriented programming on top of this core too, and not make them more difficult to learn than they need to be.

Racket for teaching follows a pretty similar model with teaching languages. There, programming concepts are introduced gradually, and the languages people are using also evolve gradually as they learn new concepts. That said, Racket texts don't go full-on this concept as CTM does.

## Purr as a multi-language platform

Purr is also designed as a multi-language programming platform. This means that Purr programs may consist of modules written in different languages, and all of these modules can interact with each other without overhead.

This is nothing new. The JVM, browsers, CLR, and many other things have fulfilled this purpose for a long time now. What Purr does here is adding this as a core design principle, and making both implementing new languages and writing code in these languages a "first-class citizen".

The idea is similar to Racket, in that each module describes which language it's written in, and the implementation of that language is then loaded to run that module. Language implementations are just plain Purr modules (written in any language, too), so as a natural part of running a Purr program, all language implementations are bootstrapped and all modules compiled with their respective implementation. The system semantics ensure that this happens in the right order.

A module could look like this:

```
language hello

greet.
```

And an implementation could look like this:

```
language programming_language

parser hello_grammar for hello_lang
  expr:
    "greet" -> (greet)

  root:
    expr:e "." -> e

ast hello_lang
  expr:
    (greet)

compiler hello_lang to core
  (greet) ->
    (module greeting
      (from purr.io use write:)
      (define main
        (call write: "Hello")))

pipeline: source
  source
  > (parse _ hello_grammar)
  > (compile _ hello_lang)
```

Running this program would load the module `programming_language` to compile the implementation of `hello`, then use that implementation to compile the `hello` program. Finally it'd run the `main` entry in the `hello` program, showing "Hello" on the screen.

Furthermore, the `hello` language should get basic capabilities for rich debugging (including time-travel), profiling, visualising data, rich editing in the IDE, package manager, build pipeline (including binary distributions), a big standard library/ecosystem, etc. in the terms of the `hello` language, and without requiring any further effort for that.

## Live programming

Languages compile their source to Core, an intermediate representation used by Purr. Core can be compiled down to a JavaScript application (running on the browser or Node.js), or ran directly by the CoreVM, a bytecode VM with a simple JIT.

The CoreVM fulfils a similar purpose of the Self VM, allowing programmers to immediately see the effects of their changes in the program. Unlike most Smalltalk dialects, Purr clearly separates module declarations from data, which makes serialisation simpler, and supports using existing VCS systems.

## Social programming and trust

Programming is a social activity. We rely on each other's code all the time. Most languages don't really have tools to support this. In languages with type systems, you can at least see what kind of contracts you're trusting, but they tend to be very vague and missing important details. Languages generally give full trust to every piece of code going through the runtime as well (Pony and Newspeak being one of the few modern exceptions).

In Purr every piece of code is a module implementing an interface. Interfaces are signatures that define a contract for modules, similar to ML's signatures, or Java's interfaces. Interfaces only support backwards-compatible changes, which means that once an interface declares that it provides something, it can never remove or change that signature. New modules can implement a new interface, or the interface may add new declarations to support new features.

Multiple modules can implement a single interface. Modules don't really have access to anything, and they can't refer to other modules directly. They can depend on interfaces. These dependencies are then resolved to decide what each module will, in fact, have access to. A search space is used for each module to define which implementations the constraint linker will see, which allows an application to define security properties and trust for each component in the system.

[David Barbour wrote a few pieces about this kind of module system](https://awelonblue.wordpress.com/2011/10/03/modules-divided-interface-and-implement/).

Since search spaces are defined at the application level, an application can swap implementations in any component to solve problems with them (upgrading dependencies, fixing bugs outside of the main distribution/backporting fixes, choosing different resource boundaries depending on compilation target, switching unmaintained libraries for maintained/forked ones, etc). None this requires any changes in source code.

## Controlling effects

Purr is a pure language, which means that there are no _side_ effects. Instead, effects are modelled as algebras, where possible effects are a set of data structures defining what can happen. Functions declare their intent of having some effect happen by performing the effects described by these data structures.

For performing effects, Purr uses effect handlers. Within a call stack, a mapping from effect type to a function that performs that kind of effect is done, so whenever a function "performs" an effect, its associated handler is invoked. This enables handlers to be overriden, which makes testing effectful code a lot simpler--just provide a new handler that doesn't go do the database/filesystem/network/etc.

Effect handlers are also the basis of Purr's live programming and time-travelling debugger.

An effect system makes these effects explicit in the function's signature. This is interesting for reasoning about the code and what kind of things it does, without having to look at the implementation of that function, and all functions called from that.

## Learning barriers for non-English speakers

People who don't speak English have a lot of problems when they want to learn programming, because they often need to learn English while they're learning programming. Not that learning English isn't a good thing, but it increases the barrier of entry to programming by a lot for these people.

Purr's language features are mostly statically known, and because every value and node allows annotations, it's possible to use a structural editor to show a translated version of the program. This allows even standard libraries and syntax to be translated without much effort, and without creating any interop or tooling issues.

## Safer, easier programming

Type systems are important for collaborative programming, since it allows people to encode their premises about how and in which context particular pieces of code work. But studies show that beginners have a hard time with types. If we force people to learn types and some basic programming concepts at the same time, they might feel overwhelmed.

To avoid that, Purr uses a combination of type inference and gradual typing. Type inference allows programmers to omit type declarations while still getting the benefits of analysis. Gradual typing allows programmers to not have to worry about types until they need to.

With strong checking and untyped parts, type errors happen at runtime, and allow people to learn more about the problem in connection with the code, since we can use both the concrete structure and the call stack to show better information. While there have been some advances in doing the same for types, debugging errors at the type level is still very difficult.
