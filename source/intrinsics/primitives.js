module.exports = ($platform) => {
  const $rt = $platform.runtime;
  const { BigInteger } = require('bigdecimal');
  const im = require('immutable');
  const { performance } = require('perf_hooks');

  $rt.$module('purr.intrinsics.primitives', {}, ($self) => {
    $self.put('bool_eq', (a, b) => a === b);
    $self.put('bool_neq', (a, b) => a !== b);
    $self.put('bool_and', (a, b) => a && b);
    $self.put('bool_or', (a, b) => a || b);
    $self.put('bool_not', (a) => !a);

    $self.put('int_eq', (a, b) => a.equals(b));
    $self.put('int_neq', (a, b) => !a.equals(b));
    $self.put('int_add', (a, b) => new $rt.Integer(a.value.add(b.value)));
    $self.put('int_sub', (a, b) => new $rt.Integer(a.value.subtract(b.value)));
    $self.put('int_not', (a) => new $rt.Integer(a.value.negate()));
    $self.put('int_div', (a, b) => new $rt.Integer(a.value.divide(b.value)));
    $self.put('int_mul', (a, b) => new $rt.Integer(a.value.multiply(b.value)));
    $self.put('int_lt', (a, b) => a.value.compareTo(b.value) < 0);
    $self.put('int_gt', (a, b) => a.value.compareTo(b.value) > 0);
    $self.put('int_lte', (a, b) => a.value.compareTo(b.value) <= 0);
    $self.put('int_gte', (a, b) => a.value.compareTo(b.value) >= 0);

    // FIXME: move these to float, but we need BigRational first
    $self.put('dec_eq', (a, b) => a === b);
    $self.put('dec_add', (a, b) => a + b);
    $self.put('dec_sub', (a, b) => a - b);
    $self.put('dec_mul', (a, b) => a * b);
    

    $self.put('text_eq', (a, b) => a.normalize() === b.normalize());
    $self.put('text_neq', (a, b) => a.normalize() !== b.normalize());
    $self.put('text_concat', (a, b) => a + b);
    $self.put('text_includes', (a, b) => a.normalize().includes(b.normalize()));
    $self.put('text_starts_with', (a, b) => a.normalize().startsWith(b.normalize()));
    $self.put('text_ends_with', (a, b) => a.normalize().endsWith(b.normalize()));
    $self.put('text_trim', (a) => a.trim());
    $self.put('text_trim_left', (a) => a.trimLeft());
    $self.put('text_trim_right', (a) => a.trimRight());

    $self.put('vec_eq', (a, b) => a.equals(b));
    $self.put('vec_neq', (a, b) => !a.equals(b));
    $self.put('vec_at', (a, i) => a.get(i.value.floatValue() + 1));
    $self.put('vec_size', (a) => new $rt.Integer(new BigInteger(a.size.toString())));
    $self.put('vec_concat', (a, b) => a.concat(b));
    $self.put('vec_map', (a, b) => a.map(b));
    $self.put('vec_flatmap', (a, b) => a.flatMap(b));
    $self.put('vec_filter', (a, b) => a.filter(b));
    $self.put('vec_zip', (a, b) => a.zip(b));
    $self.put('vec_zipwith', (a, b, f) => a.zipWith(f, b));
    $self.put('vec_sort', (a, f) => a.sort((a, b) => { return f(a, b).value.floatValue() }));


    $self.put('ffi_require', (m, p) => m.meta.require(p));
    $self.put('ffi_project', (r, f) => {
      const v = r[f];
      if (v == null) {
        throw new Error(`No valid field ${f}`);
      }
      return v;
    });

    $self.put('eq', (a, b) => $rt.eq(a, b));
    $self.put('show', (a) => $rt.show(a));
    $self.put('indent', (n, a) => a.split(/\r\n|\r|\n/).map(x => `${" ".repeat(n)}${x}`).join('\n'));
    $self.put('panic', (e) => { throw new Error(e) });

    $self.put('bench_time', (desc, fn, n) => {
      return () => {
        const times = n.value.floatValue();
        const use = (x) => { try { Math.random(x) } catch(e) { } };
        let x;
        const timed = () => {
          for (var i = 0; i < times; ++i) {
            x = fn();
          }
        };

        performance.mark('warmup start');
        timed();
        performance.mark('warmup end');
        use(x);
        performance.mark('hot start');
        timed();
        performance.mark('hot end');
        use(x);
        
        performance.measure('warmup', 'warmup start', 'warmup end');
        performance.measure('hot', 'hot start', 'hot end');
        performance.measure('total', 'warmup start', 'hot end');
        
        const warmupTime = performance.getEntriesByName('warmup')[0].duration;
        const hotTime = performance.getEntriesByName('hot')[0].duration;
        const totalTime = performance.getEntriesByName('total')[0].duration;

        console.log('-', desc);
        console.log('  | Warmup time:', `${warmupTime}ms`, `(${warmupTime / 100} median)`);
        console.log('  | Hot time:',    `${hotTime}ms`, `(${hotTime / 100} median)`);
        console.log('  | Total time:',  `${totalTime}ms`, `(${totalTime / 200} median)`);
        console.log('');
        
        performance.clearMarks();
        performance.clearMeasures();

        return [desc, [warmupTime, hotTime, totalTime]];
      };
    });

    $self.put('bench_suite', (n, xs) => {
      console.log(n);
      console.log('-'.repeat(n.length));
      console.log('');

      const tag = (t) => t < 1   ? `${-t}x faster`
                      :  t > 1   ? `${t}x slower`
                      :  /* _ */   `${t}x`;

      const listFast = (xs, n) => {
        const base = xs[0][1];
        const ts = xs.map(([d, t]) => `  ${d} (${t}ms / ${tag(t / base)})`);
        console.log(`${n}:\n${ts.join('\n')}`);
      }

      const times  = xs.toArray().map(f => f());
      const warmup = times.map(x => [x[0], x[1][0]]).sort(([_, a], [__, b]) => a - b);
      const hot    = times.map(x => [x[0], x[1][1]]).sort(([_, a], [__, b]) => a - b);
      const total  = times.map(x => [x[0], x[1][2]]).sort(([_, a], [__, b]) => a - b);
      
      console.log('---');
      listFast(warmup, 'warmup');
      listFast(hot, 'hot');
      listFast(total, 'total');
    });

    $rt.$public($self, Object.keys($self.getScope().bindings));
  });
};