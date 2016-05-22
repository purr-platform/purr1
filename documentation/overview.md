# Canel.és

Canel.és is a programming language framework, designed primarily for teaching,
but it can also be used for safe sandboxing and general-purpose programming.


## The Concept

As a programming language **framework**, Canel.és itself has no concrete
syntax. Instead, it provides an intermediate format and semantics that
can be used by different "interfaces" (syntaxes). These interfaces are
called *layers*.

A Canel.és layer is a program that implements facilities to support a
programming language that runs on top of Canel.és intermediate format
(the Core language). Minimally a layer must provide at least a compiler,
that translates source code in that language to a valid Core program:

```mli
module type LAYER (ast : CoreAST) = sig
  compile : (String) => CoreAST
end
```

Note that layers are parameterised by the CoreAST, that will be provided
when constructing a layer. The `compile` process it must provide takes
the source code, as a string, and returns a Core program by constructing
nodes of this AST.

Additionally a layer would provide other features to support editing
programs in the ecosystem, such as a code formatter, a linter, a
highlighter, static analysers, etc.

> **OPEN ISSUE**  
> Additional services are still an open issue. See the `NOTES.org`
> file for a description of this problem.


## Why Layers?

  - Teaching programming requires adding functionality incrementally, and it's
    hard to cover all things with a single language/syntax.
  
  - Every day programming requires dealing with a lot of different domains.
    Domains are better served by specific, minimal languages.


> Sure. So, I think teaching programming would benefit from an approach similar to
> what's described in CTM
> (https://mitpress.mit.edu/books/concepts-techniques-and-models-computer-programming),
> where you introduce concepts gradually, using a language that has been designed
> specifically for that concept.
> 
> This avoids the problems with choosing a single language for teaching
> everything: "we're going to see how concurrency works, oh but JavaScript only
> has CPS-based concurrency so we can't talk about threads or parallelism" or
> "we're going to see how asynchronous concurrency works, but that's a pain in
> Java because the language has poor support to continuations." or "we're going to
> talk about types, but JavaScript is untyped." or "we'd like to talk about
> structural typing, but Java only includes nominal typing."
> 
> But then using different languages also has its own problems as well: semantics,
> tooling, packages, etc. are all different, so to teach a simple concept in a
> better-suited language you need to get your students to learn all of this new
> stuff which they shouldn't ​*need*​ to.
> 
> Racket's ecosystem is very close to this ideal, I suppose: you define which
> language you're using, and that language module provides all features for this
> new language, but you'll still use the same tooling you're used to. Which is
> great. But I think Racket not having a web-based implementation of something
> like DrRacket, and having most languages using uncommon syntax like
> S-expressions increases the barrier-to-entry significantly.
> 
> So, Canelés mainly tries to address this point: "how do we teach people all of
> these different forms of programming, and how do we do it gradually, without
> compromising too much by not being able to pick too many languages, and not
> being able to teach particular concepts because the language we've chosen
> doesn't work for that?".
> 
> 
> As a way to implement that, I'm thinking in writing a web-based IDE for Canelés,
> that's like DrRacket, and allows people to easily use all of these different
> programming languages right from their web browser, and inspect programs in the
> same way they're used to.
> 
> This allows teaching concepts gradually, and having students focus on those
> concepts, by providing smaller and more focused teaching languages. One should
> also be able to let the teaching language provide new features to the IDE,
> though I have no idea of how to work with that yet. But at the very least, all
> languages should share some common set of IDE features, so people can work with
> them to understand their program, and understand why their program doesn't
> work/how to fix it.


## How Does This Work?

Each program in Canel.és begins by describing which language it's using:

```ruby
#language <language-id>
```

Here the `<language-id>` part describes a module ID that should be loaded
by the Canel.és compiler to work with this module. Currently, `<language-id>`s
are Node module identifiers (path names), and describe a Node module that
implements the Layer interface.

Modules are compiled on-the-fly, so there are no intermediate files laying
around. This is because Canel.és only does whole-program builds, rather
than modular compilation. 

> **OPEN ISSUE**  
> It's not clear how modules in Canel.és could be dynamically linked at
> this point, or even if that would be a good idea. Whole-program builds
> are required for some of the features, and for the static analysis.

All of the content after `#language <language-id>` is fed into the
`compile` service of the Layer module, and the resulting AST is then
further processed by the Canel.és compiler toolchain before being
translated to an executable form.


## The Core Language

The Core language is a minimal subset of ECMAScript 6, meaning that it
has most of the same semantics, without some of the confusing parts
of it.

The semantics are guided by the following principles:

  - The semantic should be simple to explain, and consistent.
  - Introduction forms should provide equivalent elimination forms.
  - The semantic should be orthogonal to other existing semantics.
  - The semantic should be a flexible fundamental feature, upon which other features may be built on.
  
Of course, since the Core language makes many design decisions already,
efficient implementations of languages that stray too much from these
semantics becomes an issue. Where this is the case, understand that
Canel.és chooses to provide a set of semantics that makes it easier
to introduce fundamental and good programming concepts gradually.

So, additionally, these semantics are guided by the following constraints:

  - Side-effects should be discouraged, because they make reasoning harder.
  - Non-locality should be discouraged, because it makes reasoning harder.
  - Functionality that follows from its form should be encouraged, because it
    makes translating ideas into that functionality simpler. Pattern matching
    and unions for structural recursion is an example of this.
  - Always be as explicit as possible.
  
Given these principles and constraints, the following is a summary of the set of
features present in Core:

  - **Prototype-based object orientation**. 
    Follows from JavaScript's OO model,
    makes it simpler to base namespacing services (Protocols, Modules, etc) on,
    captures the essence of OO.

  - **Closed Variants and Pattern Matching**. 
    Aids modelling and working with
    data from its form, supports natural teaching of structural recursion.

  - **Functions**. 
    For all data processing.

  - **Protocols**.
    For safe extensions.

  - **First-class Parametric Modules**. 
    For safe and flexible modularity.

  - **Efficient immutable data structures**. 
    So people can focus on data *transformations*.

  - **Variant-Based Error Handling**. 
    For expression-local error handling.

  - **First-class annotations**. 
    For documentation, testing, etc.
    
  - **Host Services**.
    For talking to host objects/etc safely.
  

These semantics are introduced in the next sections.



