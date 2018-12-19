const url = import.meta.url.replace(/.*\/boundary\//, '');

(async (...specifiers) => {
  const imports = {};
  for (const specifier of specifiers) {
    try {
      imports[specifier] = await import(specifier);
    } catch (exception) {
      imports[specifier] = exception;
    }
  }
  console.group(url);
  console.log(imports);
  console.groupEnd();
  return imports;
})(
  // ...['esm/index.js', 'mjs/index.mjs'],
  // ...['../esm/index.js', '../mjs/index.mjs'],
  // ...['./esm/index.js', './mjs/index.mjs'],
  ...['./esm/esm/index.js', './mjs/mjs/index.mjs'],
);

export default url;
