const setImmediate = typeof global !== 'undefined' && typeof global.setImmediate !== 'undefined' ? global.setImmediate : (fn, ms) => setTimeout(fn, ms)

export default setImmediate
