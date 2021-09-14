export default class EmptyCache {
  get() {
    // noop
  }

  set() {
    // noop
  }

  has() {
    return false
  }

  delete() {
    // noop
  }

  clear() {
    // noop
  }
}
