export const noop = () => {};

export const maybe = (ƒ, ...ƒn) => {
  let result;
  if (typeof ƒ === 'function' && !ƒ[maybe.Exception] && (result = ƒ[maybe.Result]) === undefined) {
    try {
      (result = ƒ()) &&
        typeof result.then === 'function' &&
        typeof result.catch === 'function' &&
        (result = result.catch(noop) || result);
      ƒ[maybe.Result] = result;
    } catch (exception) {
      ƒ[maybe.Exception] = exception;
    }
  }
  return result === undefined && ƒn.length > 1 ? maybe(...ƒn) : result;
};

maybe.Exception = Symbol('maybe.Exception');
maybe.Result = Symbol('maybe.Result');

const createResolver =
  /** @param {URL | string} base */
  base => {
    const resolver = (specifier, referrer = resolver.base) => `${new URL(specifier, referrer || undefined)}`;
    resolver.base = base;
    return resolver;
  };

export const createResolve =
  /** @param {URL | string} root @param {URL | string} [base] */
  (root, base = root || 'file:///', resolve = createResolver(base)) => (
    (root = (root && maybe(() => resolve(root))) || 'file:///'),
    (base = resolve.base = maybe(() => resolve(process.cwd(), 'file:///'), () => resolve('./', self.location)) || root),
    {root, base, resolve}
  );
