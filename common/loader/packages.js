import {PackageRecord} from './package-record.js';
import {entryURLFrom, readFromURL} from './helpers.js';

/**
 * Package records for loaders
 *
 * @typedef {{record?: PackageRecord, url?: string, source?, error?}} Entry
 *
 * @export
 * @class Packages
 */
export class Packages {
  /**
   * Creates an instance of Packages for a specific resolver
   *
   * @param {Entry} resolver
   * @memberof Packages
   */
  constructor(resolver) {
    /**
     * Cache-backed URL-keyed PackageRecord map
     *
     * @type {Map<string, Entry>}
     */
    this.cache = new Map();
    this.resolver = resolver;
  }

  /**
   * Returns the PackageRecord instance for the normalized URL
   *
   * @param {URL | string} url
   * @memberof Packages
   */
  async getRecordFrom(url) {
    const {
      constructor: Species = Packages,
      defaultPackageEntry = (this.defaultPackageEntry = Species.defaultPackageEntry || 'package.json'),
      cache = (this.cache = new Map()),
    } = this;

    const normalizedURL = Species.normalizedPackageURLFrom(url, defaultPackageEntry);

    const key = normalizedURL.href;
    let promise = cache.get(key);

    const {record, error} = await (promise ||
      ((promise = this.createEntryFromURL(normalizedURL)),
      cache.set(key, (promise = this.createEntryFromURL(normalizedURL))),
      promise));

    if (error) throw error;

    return record;
  }

  /**
   * Returns a PackageRecord along with its metadata
   *
   *  TODO: [critical]
   * @todo Ensure entry.error is handled per specs
   *
   * @param {URL} packageURL - Normalized URL for the package source
   * @returns {Entry}
   * @memberof Packages
   */
  async createEntryFromURL(packageURL) {
    let record, error, url, source;
    try {
      source = await this.readPackageFromURL(packageURL);
      if (source && typeof source === 'object') {
        source = `${typeof source.text === 'function' ? (await source.text()) || '' : source}`;
      } else if (typeof source !== 'string') {
        source = undefined;
      }
      record = PackageRecord.fromSource(source);
    } catch (exception) {
      // TODO: Ensure errors conform to current implementation
      error = exception;
    }
    return {record, error, url, source};
  }

  /**
   * Returns the source text from package URL
   *
   * @param {URL} packageURL - Normalized URL for the package source
   * @returns {string}
   * @memberof Packages
   */
  async readPackageFromURL(packageURL) {
    return this.resolver && this.resolver.read ? this.resolver.read(packageURL) : readFromURL(packageURL);
  }

  /**
   * Normalizes or constructs a normalized URL object for a package entry
   *
   * @static
   * @param {string | URL} url
   * @param {string} [packageEntry = "package.json"]
   * @returns
   * @memberof Packages
   */
  static normalizedPackageURLFrom(url, packageEntry = (this && this.defaultPackageEntry) || 'package.json') {
    if (packageEntry && typeof packageEntry === 'string') {
      const packageURL = url && entryURLFrom(url, packageEntry);
      if (packageURL) {
        !packageURL.search || packageURL.protocol !== 'file' || (packageURL.search = '');
        !packageURL.hash || (packageURL.hash = '');
        return packageURL;
      }
    }
  }
}
