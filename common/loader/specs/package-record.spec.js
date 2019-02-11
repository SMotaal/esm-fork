/**
 * @typedef {import('assert')} assert
 * @typedef {typeof import('../package-record').PackageRecord} PackageRecord
 * @typedef {{assert: assert, PackageRecord: PackageRecord}} Dependencies
 * @typedef {Dependencies} Options
 * @param {Options} [options]
 */
export default async function*(options = {}) {
  let {assert = await import('assert'), PackageRecord = (await import('../package-record.js')).PackageRecord} = options;

  assert.strict && (assert = assert.strict);

  const tests = [];

  {
    const exists = true;
    const isValid = true;
    const hasMain = true;
    const isESM = true;
    const main = 'main';
    const exports = {};

    tests.push(
      ...[
        'PackageRecord',
        () => new PackageRecord() instanceof PackageRecord,
        [
          'PackageRecord.fromSource(…)',
          ...(() => {
            return [
              (packageRecord => [
                () => (packageRecord = PackageRecord.fromSource()),
                () => packageRecord.exists === false,
                () => packageRecord.isValid === true,
                () => packageRecord.hasMain === false,
                () => packageRecord.isESM === false,
                () => packageRecord.main === '',
                () => packageRecord.exports === undefined,
              ])(),
              (packageRecord => [
                () => (packageRecord = PackageRecord.fromSource('\n')),
                () => packageRecord.exists === true,
                () => packageRecord.isValid === false,
                () => packageRecord.hasMain === false,
                () => packageRecord.isESM === false,
                () => packageRecord.main === '',
                () => packageRecord.exports === undefined,
              ])(),
              (packageRecord => [
                () => (packageRecord = PackageRecord.fromSource({})),
                () => packageRecord.exists === true,
                () => packageRecord.isValid === true,
                () => packageRecord.hasMain === false,
                () => packageRecord.isESM === false,
                () => packageRecord.main === '',
                () => packageRecord.exports === undefined,
              ])(),
              (packageRecord => [
                () => (packageRecord = PackageRecord.fromSource({main})),
                () => packageRecord.exists === true,
                () => packageRecord.isValid === true,
                () => packageRecord.hasMain === true,
                () => packageRecord.isESM === false,
                () => packageRecord.main === main,
                () => packageRecord.exports === undefined,
              ])(),
              (packageRecord => [
                () => (packageRecord = PackageRecord.fromSource({exports})),
                () => packageRecord.exists === true,
                () => packageRecord.isValid === true,
                () => packageRecord.hasMain === false,
                () => packageRecord.isESM === true,
                () => packageRecord.main === '',
                () => packageRecord.exports === exports,
              ])(),
              (packageRecord => [
                () => (packageRecord = PackageRecord.fromSource({main, exports})),
                () => packageRecord.exists === true,
                () => packageRecord.isValid === true,
                () => packageRecord.hasMain === true,
                () => packageRecord.isESM === true,
                () => packageRecord.main === main,
                () => packageRecord.exports === exports,
              ])(),
            ];
          })(),
        ],
      ],
    );
  }
}
