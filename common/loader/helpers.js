/// Errors

export class SpecifierError extends URIError {}
export class PackageNameError extends URIError {}
export class PackageConfigurationError extends EvalError {}
export class LocationError extends ReferenceError {}
export class FormatError extends TypeError {}
export class ExtensionError extends TypeError {}

/// Serialization

/**
 * Ensures source parses to an object which is not an array
 *
 * @export
 * @param {{[name:string]} | string} source JSON or parsed source
 * @returns {{[name:string]}}
 */
export function parsedObjectFrom(source) {
  try {
    const sourceType = typeof source;
    const parsedSource = sourceType === 'string' ? JSON.parse(source) : source;
    const validSource = (parsedSource && typeof parsedSource === 'object' && !Array.isArray(parsedSource)) || false;
    if (validSource) return parsedSource;
  } catch (exception) {
    // TODO: Consider traceablity vs conformance
  }
}

/// Location

export const EntryPart = /([^/]*(?:[#?].*)?$)/;
export const DirectoryPart = /(^[^#?]*\/)/;
export const PathnameParts = /^([^#?]*\/)([^/]*)$/;
export const SchemePart = /(^[a-z]+:(?=[/]{2}))/i;
export const StandardSchemes = Object.freeze(['file', 'https', 'http']);

/**
 * Ensures url is or constructs into a valid URL object
 *
 * @export
 * @param {URL | string} specifier
 * @returns {URL}
 */
export function validURLFrom(specifier, referrer) {
  const invalidURLs = {
    ['object']: new WeakSet(),
    ['string']: new Set(),
  };
  return (validURLFrom = (specifier, referrer) => {
    if (specifier) {
      const type = specifier && typeof specifier;
      const href = `${specifier}`;
      if (referrer && /^\.{1,2}\//.test(href)) {
        try {
          return new URL(specifier, referrer);
        } catch (exception) {
          invalidURLs[typeof referrer] && invalidURLs[typeof referrer].add(referrer);
        }
      }
      if (type === 'object' && specifier instanceof URL) return specifier;
      if (type in invalidURLs && !invalidURLs[type].has(specifier)) {
        try {
          return new URL(`${specifier}`, referrer ? `${referrer}` : undefined);
        } catch (exception) {
          invalidURLs[type].add(specifier);
        }
      }
    }
  })(specifier, referrer);
}

/**
 * Modifies or constructs a URL object for an entry
 *
 * @export
 * @param {*} url
 * @param {string} [entryName] - the trailing path excluding
 * @returns
 */
export function entryURLFrom(url, entryName) {
  if (url && (url = validURLFrom(url))) {
    const pathname = url.pathname || '/';
    entryName && (url.pathname = pathname.replace(EntryPart, entryName));
    return url;
  }
}

export async function readFromURL(url, options = {'no-referrer': true}) {
  const href = (url && url.href) || `${url}`;
  let scheme = (url && url.protocol) || (SchemePart.exec(href) || '')[0] || '';
  if (typeof fetch === 'function' && StandardSchemes.includes(scheme)) {
    return `${await (await fetch(url, options)).text()}`;
  }
  if (typeof process === 'object' && (!scheme || scheme === 'file:')) {
    if (typeof url === 'string') {
      // TODO: Convert windows paths (if needed)
      url = new URL(url, 'file:///');
    }
    return `${(await import('fs')).readFileSync(url)}`;
  }
}

// try {
//   if (specifier) {
//     if (referrer) return new URL(specifier, new URL(referrer));
//     return new URL(specifier);
//   }
//   // return referrer ? new URL(specifier, referrer) : new URL(specifier);
// } catch (exception) {
//   console.log('validURLFrom(%O, %O) => ', specifier, referrer, exception);
// }
