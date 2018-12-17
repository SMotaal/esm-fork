import {EntryPart} from './helpers.js';

export class Resolver {
  /**
   * @param {string | URL} base
   */
  constructor(base) {
    // Construct resolver's url from normalized base
    const url = (this.url = new URL(`${base}`.replace(EntryPart, ''), 'file:///'));

    // Set base and root from resolver's URL
    this.base = url.href;
    this.root = url.pathname;
  }

  /**
   * @param {string} specifier
   * @param {string} [referrer]
   * @param {this['resolve']} [resolve]
   * @returns {{url: string, format: string}}
   */
  async resolve(specifier, referrer = this.base, resolve) {
    if (resolve) return resolve(specifier, referrer);
  }

  /**
   * Returns true or false to indicate existance (undefined when unavailable).
   *
   * @param {string | URL} url
   * @returns {Promise<boolean | undefined>}
   * @memberof Resolver
   */
  async find(url) {}

  /**
   * Returns source text as string (undefined when unavailable).
   *
   * @param {string | URL} url
   * @returns {Promise<string | undefined>}
   * @memberof Resolver
   */
  async read(url) {}

  /**
   * @param {string | URL} [base]
   * @param {object} [defaults]
   * @returns {Resolver['resolve']}
   */
  static createResolver(base, defaults) {
    const Species = this || Resolver;
    let resolver;
    /** @type {Resolver['resolve']} */
    return (specifier, referrer, resolve) =>
      (resolver || (resolver = Object.assign(new Species(import.meta.url), defaults))).resolve(
        specifier,
        referrer,
        resolve,
      );
  }
}

// export const resolve = Resolver.createResolver(import.meta.url);

// /** @type {Resolver['resolve']} */
// export const resolve = (specifier, referrer, resolve) =>
//   (resolver || (resolver = new Resolver(import.meta.url))).resolve(specifier, referrer, resolve);

// var loc = new URL('file:///c:/'); loc = new URL(loc.pathname, loc); [loc.href, (loc.pathname = loc.pathname.replace(/\/?[^/]*$/, '/../../'), loc.href)]

// /**
//  * @param {string} specifier
//  * @param {string} [referrer]
//  */
// getAbsoluteURLFrom(specifier, referrer = this.base) {
//   return `${new URL(specifier, referrer)}`.href;
// }
