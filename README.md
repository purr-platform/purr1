Canel.és
========

Canel.és is a layered subset of the ECMAScript language, designed to be a safe
embedded interpreter, and to be used for teaching programming.

See the `notes.org` file for current experimentations~

- - -

ECMAScript is pretty ubiquitous, which makes it a fairly useful language to learn, but a lot of
its historical accidents makes it difficult to learn, and difficult to write safe programs in.
Canel.es is a programming language framework(more information on what this means later) for
teaching programming, and writing safe programs.

It's an ECMAScript 6 dialect that's heavily inspired by Swift, Racket, and ECMAScript.


## Language layers

Core to Canel.es is the idea of language layers. A layer is something that provides the features
users interact with. Layers can be composed by writing a new layer that provides the features
of both (it's not possible to compose layers automatically because layers also provide parsing
features, and syntax does not compose).

A program in Canel.es starts by specifying which layer it uses:

```js
#language caneles/teaching-kernel;
```

If you're familiar with Racket, it's pretty much the same thing. This first declaration defines
how we handle the rest of the file. In this case, it defines that the rest of the file uses the
`caneles/teaching-kernel` language.

Where do these languages come from? In Canel.es, the identifier after `#language` is a Node
module identifier, so in this instance it would be equivalent of `require("caneles/teaching-kernel")`.
A layer module is any JavaScript module that fulfils the following interface:

```mli
(CanelesCoreAST) => (String) => CanelesCoreAST
```

When we compile or execute a program, first we use the layer module, parameterised by the
AST nodes we need in the compiler, to parse the contents of the file. This gives us a `CanelesCoreAST`,
which is then used by the backend compiler to provide optimisations when lowering it to
an IR. Finally, we push that IR into the code generator, or the interpreter.

> **TODO:** does it make sense to have layers return an IR instead of a CoreLanguage AST?


## Why layers?

  - Teaching programming requires adding functionality incrementally, and it's hard to cover
    al things with a single language/syntax.
  - Every day programming requires dealing with a lot of different domains. Domains are better
    served by specific, minimal languages.



## Support

If you think you've found a bug in the project, or want to voice your
frustration about using it (maybe the documentation isn't clear enough? Maybe
it takes too much effort to use?), feel free to open a new issue in the
[Github issue tracker](https://github.com/origamitower/canel.es/issues).

Pull Requests are welcome. By submitting a Pull Request you agree with releasing
your code under the MIT licence.

You can contact the author over [email](mailto:queen@robotlolita.me), or
[Twitter](https://twitter.com/robotlolita).

Note that all interactions in this project are subject to Origami Tower's
[Code of Conduct](https://github.com/origamitower/conventions/blob/master/code-of-conduct.md).


## Licence

canel.és is copyright (c) Quildreen Motta 2016, and released under the MIT licence. See the `LICENCE` file in this repository for detailed information.
