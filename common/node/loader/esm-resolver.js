import {Resolver} from '../../loader/resolver.js';
import {Packages} from '../../loader/packages.js';
import {SpecifierError, PackageNameError, LocationError, ExtensionError, validURLFrom} from '../../loader/helpers.js';

let DEBUG;

const Defaults = {format: 'legacy'};
const Formats = {ESM: 'esm', Legacy: 'legacy'};
const Messages = {InvalidExports: `invalid package exports type`};

export class ESMResolver extends Resolver {
  emitWarning(type, scope, message = Messages[type]) {
    if (message && type && typeof type === 'string') {
      const {
        warnings = (this.warnings = {}),
        warnings: {[type]: {warned} = (warnings[type] = {type, message, warned: new Set()})},
      } = this;
      !scope || typeof scope !== 'string' || (scope = '');
      if (!warned.has(scope)) {
        warned.add(scope);
        scope ? console.warn(`[%s] %s <%s>`, type, message, scope) : console.warn(`[%s] %s`, type, message);
      }
    }
  }

  get packages() {
    const packages = new Packages(this);
    Object.defineProperty(this, 'packages', {value: new Packages(this)});
    return packages;
  }

  /**
   * Returns true if the specifier is a builtin specifier.
   *
   * @param {string} specifier
   * @returns {boolean}
   * @memberof NodeResolver
   */
  isBuiltin(specifier) {}

  /**
   *
   *
   * @param {string} specifier
   * @param {string | URL} referrer
   * @param {boolean} [isMain]
   * @returns {{url: string | URL, format: string}}
   * @memberof NodeResolver
   */
  async resolveSpecifier(specifier, referrer, isMain = false) {
    let url, format;
    const meta = {specifier, referrer, isMain};

    if (typeof specifier !== 'string') {
      throw new SpecifierError(`Specifier must be a string`);
    } else if (!specifier) {
      throw new SpecifierError(`Specifier cannot be empty`);
    } else if (specifier.startsWith('/')) {
      throw new SpecifierError(
        `Specifier "${specifier}" is not allowed (must be package-relative, relative or absolute specifiers)`,
      );
    }

    if (this.isBuiltin(specifier)) {
      return {url: meta.builtin = `node:${specifier}`, format: 'builtin'};
    } else {
      // url = specifier.startsWith('./') || specifier.startsWith('../')
      url = /^\.{1,2}\//.test(specifier)
        ? (meta.relative = validURLFrom(specifier, referrer))
        : (meta.absolute = validURLFrom(specifier)) ||
          (meta.package = await this.resolvePackageSpecifier(specifier, referrer));

      if (!url) {
        console.log(meta);
        throw new LocationError(`"${specifier}" could not be resolved${referrer ? ` from "${referrer}"` : ''}`);
      } else if ((await this.find(url)) === false) {
        console.log(meta);
        throw new LocationError(`"${specifier}" resolves to "${url}" which could not be found`);
      }

      format = await this.resolveFormat(url, isMain);

      return {url, format};
    }
  }

  async resolvePackageSpecifier(specifier, referrer) {
    let packageName, packagePath, packageScope, resolvedURL;

    if (typeof specifier !== 'string') {
      throw new SpecifierError(`Package specifier must be a string (not ${typeof specifier})`);
    } else if (!(specifier = specifier.trim())) {
      throw new SpecifierError(`Package specifier cannot be empty`);
    }

    if (specifier[0] === '@') {
      [packageScope, packageName, packagePath = ''] = specifier.split('/', 3);
      if (packageScope === '@' || !packageName) {
        throw new PackageNameError(`Package specifier "${specifier}" does not start with a valid package name`);
      }
      packageName = `${scope}/${packageName}`;
    } else if (specifier.includes('/')) {
      [packageName, packagePath = ''] = specifier.split('/', 2);
      if (!packageName) {
        throw new PackageNameError(`Package specifier "${specifier}" does not start with a valid package name`);
      }
    } else {
      packagePath = '';
      packageName = specifier;
    }

    const {packages, packagePrefix = '/node_modules/', extensions} = this;

    for (const parentURL of this.parentsFrom(referrer)) {
      const packageLocation = `${parentURL}${packagePrefix}${packageName}/`;
      const packageRecord = await packages.getRecordFrom(`${parentURL}${packagePrefix}${packageName}/`);

      // TODO: Handle unexpected or missing record
      if (!packageRecord) break;

      const {exists, isValid, isESM, main, exports} = packageRecord;

      // TODO: Handle invalid package
      if (!packageRecord.exists || !packageRecord.isValid) continue;

      if (packageRecord.isESM) {
        // PACKAGE_EXPORTS_RESOLVE
        if (typeof exports === 'string') {
          if (packagePath || !exports) {
            throw new LocationError(
              `Package specifier "${specifier}" resolves to the ESM package "${packageLocation}" which ${
                exports ? `only exports ${exports}` : 'does not export modules'
              }`,
            );
          }
          return (resolvedURL = validURLFrom(exports, packageLocation));
        }

        if (!exports || typeof exports !== 'object') {
          this.emitWarning('InvalidExports', packageLocation);
          throw new LocationError(
            `Package specifier "${specifier}" resolves to the ESM package "${packageLocation}" which does have valid exports`,
          );
        }

        const targeted = `./${packagePath}`;
        let target = exports[targeted];

        if (packagePath && !target) {
          target = targeted;
          for (const exported of Object.getOwnPropertyNames(exports)) {
            if (!exported.startsWith('./')) {
              this.emitWarning('InvalidExports', `${packageLocation} - ${exported}`);
            } else if (
              exported.endsWith('/') &&
              targeted.startsWith(exported) &&
              targeted.lastIndexOf('/') === exported.length - 1
            ) {
              target = targeted.replace(exported, exports[exported]);
              break;
            }
          }
        }

        if (target && target.startsWith('./') && !target.endsWith('/')) {
          return (resolvedURL = validURLFrom(target, packageLocation));
        }

        throw new LocationError(
          `Package specifier "${specifier}" resolves to the invalid target "${target}" through the ESM package "${packageLocation}"`,
        );
      } else if (packagePath) {
        return (resolvedURL = validURLFrom(specifier, packageLocation));
      } else if (main) {
        return (resolvedURL = validURLFrom(main, packageLocation));
      } else if (extensions) {
        // LOAD_AS_DIRECTORY (CJS)
        for (const extension of extensions) {
          const main = `index${extension}`;
          const url = validURLFrom(main, packageLocation);
          if (url && (await this.find(url))) {
            packageRecord.main = main;
            return (resolvedURL = url);
          }
        }
      }
    }
  }

  async resolveFormat(resolvedURL, isMain) {
    // const DEBUG = true;
    const {packages, packagePrefix = '/node_modules/', extensions} = this;
    const url = validURLFrom(resolvedURL);
    const pathname = ((url && url.pathname) || '').trim();

    if (!url || !pathname || pathname.endsWith('/')) {
      throw new LocationError(`"${resolvedURL}" is not a valid URL`);
    }

    const basename = pathname.slice(pathname.lastIndexOf('/') + 1) || '';
    const extension =
      basename
        .slice(basename.lastIndexOf('.'))
        .trim()
        .toLowerCase() || '';

    resolvedURL = `${resolvedURL}`;
    const parents = DEBUG ? [...this.parentsFrom(resolvedURL)] : this.parentsFrom(resolvedURL);
    DEBUG && (parents.seen = {});

    try {
      for (const parentURL of parents) {
        const packageRecord = await packages.getRecordFrom(parentURL);
        // TODO: Handle unexpected or missing record
        if (!packageRecord) {
          console.warn(`Failed to get package record from "${parentURL}"`);
          continue;
        }

        const {exists, isValid, isESM, format = isESM ? 'ESM' : 'Legacy'} = packageRecord;

        DEBUG && (parents.seen = {...parents.seen, [parentURL]: packageRecord});

        if (!exists || !isValid) continue;

        if (
          isESM ? extension !== '.js' && extension !== '.mjs' : extension === '.mjs' || !extensions.includes(extension)
        )
          throw new ExtensionError(
            `"${resolvedURL}" is inside an ${format} package boundary and uses an unsupported extension ("${extension ||
              'no extension'}")`,
          );

        return Formats[format] || Defaults.format;
      }
    } finally {
      if (DEBUG && parents.seen) {
        console.group(`resolveFormat(%O,, %O)`, resolvedURL, isMain);
        for (const parent of parents) console.log(` %s  %O => %o`, '\u{26AB}', parent, parents.seen[parent]);
        console.groupEnd();
      }
    }
    return Defaults.format;
  }

  *parentsFrom(url) {
    let parentURL = new URL('.', url);
    let paths = parentURL.pathname.split('/');
    const root = `/${parentURL.protocol === 'file:' && /^[a-z]:$/i.test(paths[1]) ? `${paths[1]}/` : ''}`;
    // While url is not the file system root,
    for (let n = paths.length; --n; ) {
      // Set url to the parent folder URL of url
      const pathname = `${paths.slice(0, n).join('/')}/`;
      if (!pathname || !pathname.startsWith(root) || pathname === root) return;
      yield `${((parentURL.pathname = pathname), parentURL)}`;
    }
  }
}

// * SEE: https://github.com/guybedford/ecmascript-modules/blob/b2654360f9e81eff96f9e1e3ba3a712586b6168c/doc/api/esm.md
