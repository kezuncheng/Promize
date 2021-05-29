const Promize = require('./promize')

module.exports = {
  resolved: Promize.resolve,
  rejected: Promize.rejected,
  deferred: function() {
    let resolve
    let reject
    const p = new Promize((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })
    return {
      promise: p,
      resolve,
      reject
    }
  }
}