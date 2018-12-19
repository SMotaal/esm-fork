import {parsedObjectFrom} from './helpers.js';
import {SourceRecord} from './source-record.js';

const ExportsTypes = ['undefined', 'boolean', 'object'];
const ImportsTypes = ['undefined', 'boolean', 'object'];

/**
 * Loader-specific record for a module.
 *
 * @typedef {import("./module-source").ModuleSource} ModuleSource
 *
 * @export
 * @class ModuleRecord
 */
export class ModuleRecord extends SourceRecord {
  /** @param {Partial<ModuleRecord>} [record] */
  constructor(record) {
    let exists, isValid, format, exports, imports;
    record && ({exists, isValid, format, exports, imports} = record);
    // TODO: Validate values before calling super
    super();
    /** @type {boolean} */
    this.exists = exists;
    /** @type {boolean} */
    this.isValid = isValid;
    /** @type {boolean} */
    this.hasMain = hasMain;
    /** @type {string} */
    this.format = format;
    /** @type {{[name:string]: string} | false} */
    this.exports = exports;
    /** @type {{[name:string]: string} | false} */
    this.imports = imports;
  }

  // /**
  //  * Create ModuleRecord from an existing string or object source.
  //  *
  //  * @static
  //  * @param {ModuleSource} source
  //  * @returns {ModuleRecord}
  //  * @memberof ModuleRecord
  //  */
  // static fromSource(source) {
  // }
}
