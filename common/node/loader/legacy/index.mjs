import {existsSync, readFileSync} from 'fs';
import {builtinModules} from 'module';
import process, {cwd, argv} from 'process';

// console.time('node-loader-legacy');
// process.on('exit', () => console.timeEnd('node-loader-legacy'));

const ROOT = `file://`;
const SCOPE = `${new URL('../../../../', import.meta.url)}`;
const SCOPES = ['/common/loader/', '/common/node/loader/'].map(s => `${SCOPE}${s.slice(1)}`);

let main;
const mainArgv = argv[1];
const Scoped = url =>
  (url && (url = `${url}`).startsWith(SCOPE) && SCOPES.find(s => url.startsWith(s)) && url) || undefined;

const resolver = new class Resolver {
  async resolve(specifier, referrer, resolve) {
    let resolved, url, format, trace;
    try {
      const {initialized = (this.initialized = this.initialize())} = this;
      // if (!referrer || specifier[0] !== '.') {
      //   trace = (referrer && 'bare') || 'main';
      //   return (resolved = resolve(specifier, referrer));
      // }
      if (referrer && Scoped(referrer)) {
        trace = 'scoped';
        ({url, format} = resolved = await resolve(specifier, referrer));
        Scoped(url) && format === 'cjs' && (resolved.format = 'esm');
        return resolved;
      }
      if (initialized && initialized.then) {
        trace = 'deferred';
        return (resolved = await (await initialized)(specifier, referrer, resolve));
      }
      return this.resolver(specifier, referrer, resolve);
    } finally {
      // trace && Trace(trace, {specifier, referrer, ...resolved});
    }
  }

  async initialize() {
    const {ESMResolver} = await import('../esm-resolver.js');
    const resolver = (this.resolver = class extends ESMResolver {
      isBuiltin(specifier) {
        return builtinModules.includes(specifier);
      }

      async find(url) {
        return (url && existsSync(new URL(url, `${ROOT}/`))) || false;
      }

      async read(url) {
        return `${(url && readFileSync(new URL(url, `${ROOT}/`))) || ''}`;
      }

      async resolve(specifier, referrer = this.base, resolve) {
        let resolved, url, format, isMain, trace;
        try {
          main || specifier !== mainArgv || (specifier = main = specifier.replace(/^\//, `${ROOT}/`));
          isMain = specifier === main;

          ({url, format} = resolved = await this.resolveSpecifier(specifier, referrer, isMain));
          resolved.url = `${url}`;
          isMain && (resolved.main = true);
          trace = (resolved && (format || 'unknown')) || 'unresolved';
          return resolved;
        } finally {
          // trace && Trace(trace, {specifier, referrer, ...resolved});
        }
      }

      async resolveIndex(location, extensions = this.extensions) {
        let url;
        if (extensions && location)
          for (const extension of extensions)
            if (await this.find((url = new URL(`index${extension}`, location)))) return `${url}`;
      }
    }.createResolver(`${ROOT}/${cwd()}`, {
      extensions: ['.js', '.json', '.node', '.mjs'],
    }));

    // this.resolve = resolver;
    this.initialized = true;
    return resolver;
  }
}();

export const resolve = (...args) => resolver.resolve(...args);

const Trace = (type, details) => void console.log(`\n<%s> %o\n`, type, details);

// console.log({specifier, referrer, isMain, resolved});
// if (resolved.format === 'esm') return resolved;
// return resolve(specifier, referrer);

// if (resolve) return resolve(specifier, referrer);

// if (initialized && initialized !== true) {
//   let {url, format} = (resolved = resolve(specifier, referrer));
//   if (!cache.esm.has(url)) {
//     format !== 'cjs' ||
//       specifier[0] !== '.' ||
//       url.includes('/legacy/') ||
//       !(url.includes('/loader/') || url.includes('/esm/')) ||
//       (cache.esm.add(url), (resolved.format = 'esm'));
//   } else {
//     resolved.format = 'esm';
//   }
// } else if (initialized && initialized.then) {
//   resolved = false;
//   return initialized.then(next => next(specifier, referrer, resolve));
// } else {
//   console.error(
//     `[Resolver]: Unexpected initialization state while resolving %O from %O (initialized = %O)`,
//     specifier,
//     referrer,
//     initialized,
//   );
// }
// return resolved || (resolved = resolve(specifier, referrer));
