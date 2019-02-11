/**
 * Async linking abstraction for resources and bindings
 *
 * @class Linker
 */
class Linker {
  constructor(loader) {
    this.loader = loader;
  }

  async *link() {}
}
