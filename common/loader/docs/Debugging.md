# Debugging Loaders

## Timing

**Timing for Cross/Hybrid Implementations**

Timing resolver implementations against each other gets tricky when implementating across thresholds (ie C++ versus JS). Faithfully comparing such cases may not be possible and timing the entire process of bootstrapping and loading the main module of the same module graph can be the next closest option.

**Timing for Loader-Hooked Implementations**

When implementations hook into the same loader, it is possible to use various localized timing patterns during development.

For example, the same approach used for _Timing for Cross/Hybrid Implementations_ can more accurately exclude the variability of the bootstrapping and internal loader hooking by initiating the timers at the top of some _custom loader_ (e.g. in "<var>custom-loader/index.mjs</var>" used with a `--loader` flag) and a _baseline loader_ used for comparison.

```js
/// baseline-loader/index.mjs

tracing: {
  console.time('baseline-loader');
  process.on('exit', () => console.timeEnd('baseline-loader'));
}

// Baseline resolver to compare against a custom-loader
export const resolve = (specifier, referrer, resolve) =>
  resolve(specifier, referrer);
```

## Tracing

The important thing to note is that tracing should not affect the actual stacks nor should it interfere with error handling in any way.

Tracing for resolver functions can be efficiently done with the following pattern:

```js
resolver: {

  class Resolver {
    resolve(specifier, referrer, resolve) {
      let trace, resolved;
      try {
        (resolved = this.resolveCustom(specifier, referrer, resolve));
        if (resolved) {
          return (trace = 'custom'), resolved;
        }
        return (trace = 'default'), (resolved = resolve(specifier, referrer));
      } finally {
        trace && Trace(trace, {specifier, referrer, ...resolved});
      }
    }
    resolveCustom(specifier, referrer, resolve) {
      …
    }
  }

  const Trace = (type, details) => void console.log(`\n<%s> %o\n`, type, details);

}
```
