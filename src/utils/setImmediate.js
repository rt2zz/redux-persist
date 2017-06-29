const hasNativeSupport = typeof global !== 'undefined' && typeof global.setImmediate !== 'undefined'
const setImmediate = hasNativeSupport ? (fn, ms) => global.setImmediate(fn, ms) : (fn, ms) => setTimeout(fn, ms)

export default setImmediate
