import {parsedObjectFrom} from './helpers.js';
import {SourceRecord} from './source-record.js';

const ExportsTypes = Object.freeze(['undefined', 'string', 'object']);
const MainTypes = Object.freeze(['undefined', 'string']);

/**
 * Loader-specific record for a package.
 *
 * @typedef {{[name:string]} | string} PackageRecordSource
 *
 * @export
 * @class PackageRecord
 */
export class PackageRecord extends SourceRecord {
  /** @param {Partial<PackageRecord>} [record] */
  constructor(record) {
    let exists, isValid, hasMain, isESM, main, exports;
    record && ({exists, isValid, hasMain, isESM, main, exports} = record);
    // TODO: Validate values before calling super
    super();
    /** @type {boolean} */
    this.exists = exists;
    /** @type {boolean} */
    this.isValid = isValid;
    /** @type {boolean} */
    this.hasMain = hasMain;
    /** @type {boolean} */
    this.isESM = isESM;
    /** @type {string} */
    this.main = main;
    /** @type {{[name:string]: string} | string} */
    this.exports = exports;
    // Object.freeze(this);
  }

  /**
   * Create PackageRecord from an existing string or object source.
   *
   * @static
   * @param {PackageRecordSource} source
   * @returns {PackageRecord}
   * @memberof PackageRecord
   */
  static fromSource(source) {
    let // Empty source returns { exists: false, isValid: true }
      exists = source !== undefined,
      isValid = exists || source === undefined, // !exists
      hasMain = false,
      isESM = false,
      main = '',
      exports;

    if (exists) {
      const parsedSource = parsedObjectFrom(source);

      // Invalid source returns { exists: true, isValid: false }
      if ((isValid = !!parsedSource)) {
        ({main, exports} = parsedSource);

        // Ensures hasMain ? main != '' : main = ''
        const mainType = (main === null && 'null') || typeof main;
        const validMain = MainTypes.includes(mainType);
        hasMain = (main && validMain) || false;
        hasMain || (main = '');

        // Ensures isESM ? esm = {...} : esm = undefined;
        const exportsType = (exports === null && 'null') || typeof exports;
        const validExports = ExportsTypes.includes(exportsType);
        isESM = (exports && validExports) || false;
        isESM || (exports = undefined);

        // Valid regardless of main or exports being defined
        isValid = validMain && validExports;
      }
    }

    return new PackageRecord({exists, isValid, hasMain, isESM, main, exports});
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, {stylize = String} = {}) {
    // try {
    let string = '';
    for (const [key, value] of Object.entries(this)) {
      if (!value && value !== '') continue;
      string +=
        value === true
          ? ` <${stylize(key, 'name')}>`
          : ` ${stylize(key, 'name')}: ${stylize(JSON.stringify(value), typeof value)}`;
    }
    return `PackageRecord {${string} }`;
    // } catch (exception) {
    //   return this;
    // }
  }
}
