const path = require('path');
const fs = require('fs');
const glob = require('glob').sync;
const util = require('util');
const im = require('immutable');


function assert(test, message) {
  if (!test) {
    throw new Error(message);
  }
}

function get(n, o, k) {
  if (!o.hasOwnProperty(k)) {
    throw new Error(`Can't project ${k} from ${n}`);
  }
  return o[k];
}


const _ = module.exports = {
  $project(field) {
    if (!_.hasOwnProperty(field)) {
      throw new Error(`No field ${field} in primitives`);
    }
    return _[field];
  },

  Dec64: {
    $project: (k) => get('Decimal_64', _.Dec64, k),
    hasInstance: x => typeof x === 'number',
    type: {
      hasInstance: x => x === _.Dec64
    }
  },

  Text: {
    $project: (k) => get('Text', _.Text, k),
    hasInstance: x => typeof x === 'string',
    type: {
      hasInstance: x => x === _.Text
    }
  },

  Bool: {
    $project: (k) => get('Boolean', _.Boolean, k),
    hasInstance: x => typeof x === 'boolean',
    type: {
      hasInstance: x => x === _.Bool
    }
  },

  Vector: {
    $project: (k) => get('Vector', _.Vector, k),
    hasInstance: x => Array.isArray(x),
    type: {
      hasInstance: x => x === _.Vector
    }
  },

  // FIXME: Needs to be split by arity
  Function: {
    $project: (k) => get('Function', _.Function, k),
    hasInstance: x => typeof x === 'function',
    type: {
      hasInstance: x => x === _.Function
    }
  },

  Map: {
    $project: (k) => get('Map', _.Map, k),
    hasInstance: x => im.Map.isMap(x),
    type: {
      hasInstance: x => x === _.Map
    }
  },

  Set: {
    $project: (k) => get('Set', _.Set, k),
    hasInstance: x => im.Set.isSet(x),
    type: {
      hasInstance: x => x === _.Set
    }
  },

  bool_not: x => !x,
  bool_and: (a, b) => a && b,
  bool_or: (a, b) => a || b,
  
  dec64_gt: (a, b) => a > b,
  dec64_gte: (a, b) => a >= b,
  dec64_lt: (a, b) => a < b,
  dec64_lte: (a, b) => a <= b,

  dec64_add: (a, b) => a + b,
  text_concat: (a, b) => a + b,
  vec_concat: (a, b) => a.concat(b),

  dec64_sub: (a, b) => a - b,
  dec64_mul: (a, b) => a * b,
  dec64_div: (a, b) => a / b,

  dec64_eq: (a, b) => a === b,
  text_eq: (a, b) => a === b,
  bool_eq: (a, b) => a === b,
  vec_eq: (a, b) => 
    a.length === b.length && a.every((x, i) => {
      const y = b[i];
      if (Array.isArray(x)) {
        assert(Array.isArray(y), 'Expected Vector');
        return _.vec_eq(x, y)
      } else {
        assert(['boolean', 'number', 'string'].includes(x), 'Expected Boolean, Decimal_64bit, or Text');
        assert(typeof y === typeof x, 'Expected same type');
        return x === y;
      }
    }),

  dec64_neq: (a, b) => a !== b,

  vec_map: (xs, f) => xs.map(f),
  vec_filter: (xs, f) => xs.filter(f),
  vec_size: (xs) => xs.length,
  vec_first: (xs) => {
    if (xs.length > 0) {
      return xs[0];
    } else {
      throw new Error(`Empty vector`);
    }
  },
  vec_last(xs) {
    if (xs.length > 0) {
      return xs[xs.length - 1];
    } else {
      throw new Error(`Empty vector`);
    }
  },
  vec_rest: (xs) => xs.slice(1),
  vec_slice: (xs, m, n) => xs.slice(Math.max(m - 1, 0), Math.max(n, 0)),
  vec_reversed: (xs) => xs.slice().reverse(),
  vec_at: (xs, n) => {
    if (n in xs) {
      return xs[n];
    } else {
      throw new Error(`Out of bounds ${n}`);
    }
  },
  vec_fold: (xs, i, f) => xs.reduce(f, i),
  vec_foldr: (xs, i, f) => xs.reduceRight(f, i),
  vec_zip: (xs, ys) => {
    if (xs.length !== ys.length)  throw new Error(`Vectors have different sizes`);
    return xs.map((x, i) => [x, ys[i]]);
  },
  vec_zipwith: (xs, ys, f) => {
    if (xs.length !== ys.length)  throw new Error(`Vectors have different sizes`);
    return xs.map((x, i) => f(x, ys[i]));
  },
  vec_sort: (xs, f) => xs.slice().sort(f),
  vec_flatmap: (xs, f) => xs.reduce((r, x) => {
    const item = f(x);
    assert(Array.isArray(item), `Expected array`);
    return r.concat(item);
  }, []),
  vec_intersperse: (xs, s) => _.vec_flatmap(xs, (x) => [x, s]).slice(0, -1),
  vec_join: (xs, s) => xs.join(s),

  text_to_vec: (s) => Array.from(s),
  dec_to_text: (x) => String(x),
  bool_to_text: (x) => String(x),

  fs_read: (p) => fs.readFileSync(p, 'utf8'),
  fs_exists: (p) => fs.existsSync(p),
  fs_write: (p, d) => fs.writeFileSync(p, d, 'utf8'),
  fs_path: (ps) => path.resolve(...ps),
  fs_join: (a, b) => path.join(a, b),
  fs_list: (p) => fs.readdirSync(p),
  fs_glob: (g) => glob(g),

  display: (x) => console.log(util.inspect(x, false, Infinity, true)),
  trace: (x) => { console.log(`(TRACE)\n`, util.inspect(x, false, 5, true), '\n---'); return x },
  panic: (e) => {
    throw new Error(e);
  },

  resource: (module, p) => {
    return path.resolve(module.meta.dir, p);
  },

  lines: (x) => x.split(/\r\n|\r|\n/),

  /// maps
  map_empty: () => im.Map(),
  map_from_vector: (xss) => im.Map(xss),
  map_size: (map) => map.size,
  map_put: (map, k, v) => map.set(k, v),
  map_remove: (map, k) => map.delete(k),
  map_merge: (map1, map2) => map1.merge(map2),
  map_equals: (map1, map2) => map1.equals(map2),
  map_at: (map, k) => map.get(k),
  map_at_default: (map, k, v) => map.get(k, v),
  map_has: (map, k) => map.has(k),
  map_keys: (map) => [...map.keys()],
  map_values: (map) => [...map.values()],
  map_entries: (map) => [...map.entries()],
  map_to_vector: (map) => map.toArray(),

  set_empty: () => im.Set(),
  set_from_vector: (xs) => im.Set(xs),
  set_size: (set) => set.size,
  set_add: (set, v) => set.add(v),
  set_remove: (set, v) => set.remove(v),
  set_union: (set1, set2) => set1.union(set2),
  set_intersect: (set1, set2) => set1.intersect(set2),
  set_difference: (set1, set2) => set1.subtract(set2),
  set_has: (set, v) => set.has(v),
  set_to_vector: (set) => set.toArray()
};