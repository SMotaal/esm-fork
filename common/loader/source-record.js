import {parsedObjectFrom} from './helpers.js';

const ExportsTypes = ['undefined', 'string', 'object'];
const MainTypes = ['undefined', 'string'];

/**
 * Loader-specific record for a source.
 *
 * @export
 * @class SourceRecord
 */
export class SourceRecord {
  // TODO: Wait for class properties to mature first
  // /** @param {Partial<SourceRecord>} [record] */
  // constructor(record) {
  //   Object.freeze(Object.assign(this, record));
  // }

  /**
   * Create SourceRecord from a source.
   *
   * @static
   * @param {*} source
   * @returns {SourceRecord}
   * @memberof SourceRecord
   */
  static fromSource(source, Species) {
    const {fromSource} = Species;
    if (!fromSource || fromSource === SourceRecord.fromSource)
      throw ReferenceError(
        `Cannot construct record from ${(Species && Species.name) ||
          typeof Species} which does not expose a static fromSource method.`,
      );
    return Species.fromSource(source);
  }
}
