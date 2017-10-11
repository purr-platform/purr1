module.exports = function($platform) {
  const rt = $platform.runtime;

  function isCatenable(x){ return typeof x === "number" || typeof x === "string" }

  rt.$module('purr.prelude', ($self) => {
    rt.$public($self, ["map:", "+"]);

    rt.$method($self, "map:", ["a", "b"], (xs, f) => {
      return xs.map(x => f(x));
    });

    rt.$method($self, "+", ["a", "b"], (a, b) => {
      if (!isCatenable(a) || !isCatenable(b)) {
        throw new Error(`Expected string or number`);
      }
      return a + b;
    });
  });
}