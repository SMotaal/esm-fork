### Features

The resolver has the following properties:

* FileURL-based resolution as is used by ES modules
* Support for builtin module loading
* Relative and absolute URL resolution
* No default extensions
* No folder mains
* Bare specifier package resolution lookup through node_modules

### Resolver Algorithm

The algorithm to load an ES module specifier is given through the
**ESM_RESOLVE** method below. It returns the resolved URL for a
module specifier relative to a parentURL, in addition to the unique module
format for that resolved URL given by the **ESM_FORMAT** routine.

The _"esm"_ format is returned for an ECMAScript Module, while the
_"legacy"_ format is used to indicate loading through the legacy
CommonJS loader. Additional formats such as _"wasm"_ or _"addon"_ can be
extended in future updates.

In the following algorithms, all subroutine errors are propogated as errors
of these top-level routines.

_isMain_ is **true** when resolving the Node.js application entry point.

#### ESM_RESOLVE(_specifier_, _parentURL_, _isMain_)
> 1. Let _resolvedURL_ be **undefined**.
> 1. If _specifier_ is a valid URL, then
>    1. Set _resolvedURL_ to the result of parsing and reserializing
>       _specifier_ as a URL.
> 1. Otherwise, if _specifier_ starts with _"/"_, then
>    1. Throw an _Invalid Specifier_ error.
> 1. Otherwise, if _specifier_ starts with _"./"_ or _"../"_, then
>    1. Set _resolvedURL_ to the URL resolution of _specifier_ relative to
>       _parentURL_.
> 1. Otherwise,
>    1. Note: _specifier_ is now a bare specifier.
>    1. Set _resolvedURL_ the result of
>       **PACKAGE_RESOLVE**(_specifier_, _parentURL_).
> 1. If the file at _resolvedURL_ does not exist, then
>    1. Throw a _Module Not Found_ error.
> 1. Let _format_ be the result of **ESM_FORMAT**(_url_, _isMain_).
> 1. Load _resolvedURL_ as module format, _format_.

PACKAGE_RESOLVE(_packageSpecifier_, _parentURL_)
> 1. Let _packageName_ be *undefined*.
> 1. Let _packagePath_ be *undefined*.
> 1. If _packageSpecifier_ is an empty string, then
>    1. Throw an _Invalid Package Name_ error.
> 1. If _packageSpecifier_ does not start with _"@"_, then
>    1. Set _packageName_ to the substring of _packageSpecifier_ until the
>       first _"/"_ separator or the end of the string.
> 1. Otherwise,
>    1. If _packageSpecifier_ does not contain a _"/"_ separator, then
>       1. Throw an _Invalid Package Name_ error.
>    1. Set _packageName_ to the substring of _packageSpecifier_
>       until the second _"/"_ separator or the end of the string.
> 1. Let _packagePath_ be the substring of _packageSpecifier_ from the
>    position at the length of _packageName_ plus one, if any.
> 1. Assert: _packageName_ is a valid package name or scoped package name.
> 1. Assert: _packagePath_ is either empty, or a path without a leading
>    separator.
> 1. Note: Further package name validations can be added here.
> 1. If _packagePath_ is empty and _packageName_ is a Node.js builtin
>    module, then
>    1. Return the string _"node:"_ concatenated with _packageSpecifier_.
> 1. While _parentURL_ is not the file system root,
>    1. Set _parentURL_ to the parent folder URL of _parentURL_.
>    1. Let _packageURL_ be the URL resolution of the string concatenation of
>       _parentURL_, _"/node_modules/"_ and _packageSpecifier_.
>    1. If the folder at _packageURL_ does not exist, then
>       1. Note: This check can be optimized out where possible in
>          implementation.
>       1. Set _parentURL_ to the parent URL path of _parentURL_.
>       1. Continue the next loop iteration.
>    1. Let _pjsonURL_ be the URL of the file _"package.json"_ within the parent
>       path _packageURL_.
>    1. Let _pjson_ be **null**.
>    1. If the file at _pjsonURL_ exists, then
>       1. Set _pjson_ to the result of **READ_JSON_FILE**(_pjsonURL_).
>    1. If _packagePath_ is empty, then
>       1. Let _url_ be the result of **PACKAGE_MAIN_RESOLVE**(_packageURL_, _pjson_).
>       1. If _url_ is **null**, then
>          1. Throw a _Module Not Found_ error.
>       1. Return _url_.
>    1. Otherwise,
>       1. If _pjson_ is not **null** and **HAS_ESM_PROPERTIES**(_pjson_) is
>          *true*, then
>          1. Return **PACKAGE_EXPORTS_RESOLVE**(_packageURL_, _packagePath_, _pjson_).
>       1. Return the URL resolution of _packagePath_ in _packageURL_.
> 1. Throw a _Module Not Found_ error.

PACKAGE_MAIN_RESOLVE(_packageURL_, _pjson_)
> 1. If _pjson_ is **null**, then
>    1. Return **null**.
> 1. Let _pjsonURL_ be the URL of the file _"package.json"_ within the parent
>    path _packageURL_.
> 1. If **HAS_ESM_PROPERTIES**(_pjson_) is **false**, then
>    1. Let _mainURL_ be the result applying the legacy
>       **LOAD_AS_DIRECTORY** CommonJS resolver to _packageURL_, returning
>       *undefined* for no resolution.
>    1. Return _mainURL_.
> 1. If _pjson.exports_ is a String, then
>    1. Return the URL of _pjson.exports_ within the parent path _packageURL_.
> 1. Assert: _pjson.exports_ is an Object.
> 1. If _pjson.exports["."]_ is a String, then
>    1. Let _target_ be _pjson.exports["."]_.
>    1. If **IS_VALID_EXPORTS_TARGET**(_target_) is **false**, then
>       1. Emit an _"Invalid Exports Target"_ warning.
>    1. Otherwise,
>       1. Return the URL of _pjson.exports.default_ within the parent path
>          _packageURL_.
> 1. Return **null**.

PACKAGE_EXPORTS_RESOLVE(_packageURL_, _packagePath_, _pjson_)
> 1. Assert: _pjson_ is not **null**.
> 1. If _pjson.exports_ is a String, then
>    1. Throw a _Module Not Found_ error.
> 1. Assert: _pjson.exports_ is an Object.
> 1. Set _packagePath_ to _"./"_ concatenated with _packagePath_.
> 1. If _packagePath_ is a key of _pjson.exports_, then
>    1. Let _target_ be the value of _pjson.exports[packagePath]_.
>    1. If **IS_VALID_EXPORTS_TARGET**(_target_) is **false**, then
>       1. Emit an _"Invalid Exports Target"_ warning.
>       1. Throw a _Module Not Found_ error.
>    1. Return the URL resolution of the concatenation of _packageURL_ and
>       _target_.
> 1. Let _directoryKeys_ be the list of keys of _pjson.exports_ ending in
>    _"/"_, sorted by length descending.
> 1. For each key _directory_ in _directoryKeys_, do
>    1. If _packagePath_ starts with _directory_, then
>       1. Let _target_ be the value of _pjson.exports[directory]_.
>       1. If **IS_VALID_EXPORTS_TARGET**(_target_) is **false** or _target_
>          does not end in _"/"_, then
>          1. Emit an _"Invalid Exports Target"_ warning.
>          1. Continue the loop.
>       1. Let _subpath_ be the substring of _target_ starting at the index of
>          the length of _directory_.
>       1. Return the URL resolution of the concatenation of _packageURL_,
>          _target_ and _subpath_.
> 1. Throw a _Module Not Found_ error.

IS_VALID_EXPORTS_TARGET(_target_)
> 1. If _target_ is not a valid String, then
>    1. Return **false**.
> 1. If _target_ does not start with _"./"_, then
>    1. Return **false**.
> 1. If _target_ contains any _".."_ or _"."_ path segments, then
>    1. Return **false**.
> 1. If _target_ contains any percent-encoded characters for _"/"_ or _"\"_,
>    then
>    1. Return **false**.
> 1. Return **true**.

#### ESM_FORMAT(_url_, _isMain_)
> 1. Assert: _url_ corresponds to an existing file.
> 1. Let _pjson_ be the result of **READ_PACKAGE_BOUNDARY**(_url_).
> 1. If _pjson_ is **null** or **HAS_ESM_PROPERTIES**(_pjson_) is **true**, then
>    1. If _url_ does not end in _".js"_ or _".mjs"_ then,
>       1. Throw an _Unsupported File Extension_ error.
>    1. Return _"esm"_.
> 1. Otherwise,
>    1. If _url_ ends with _".mjs"_, then
>       1. Throw an _Unsupported File Extension_ error.
>    1. Return _"legacy"_.

READ_PACKAGE_BOUNDARY(_url_)
> 1. Let _boundaryURL_ be the URL resolution of _"package.json"_ relative to
>    _url_.
> 1. While _boundaryURL_ is not the file system root,
>    1. If the file at _boundaryURL_ exists, then
>       1. Let _pjson_ be the result of **READ_JSON_FILE**(_boundaryURL_).
>       1. Return _pjson_.
>    1. Set _boundaryURL_ to the URL resolution of _"../package.json"_ relative
>       to _boundaryURL_.
> 1. Return **null**.

READ_JSON_FILE(_url_)
> 1. If the file at _url_ does not parse as valid JSON, then
>    1. Throw an _Invalid Package Configuration_ error.
> 1. Let _pjson_ be the parsed JSON source of the file at _url_.
> 1. Return _pjson_.

HAS_ESM_PROPERTIES(_pjson_)
> 1. If _pjson.exports_ is a String or Object, then
>    1. Return *true*.
> 1. Return *false*.
