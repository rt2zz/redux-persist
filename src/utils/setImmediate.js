const setImmediate = typeof global !== 'undefined' && typeof global.setImmediate !== 'undefined' ? global.setImmediate : setTimeout

export default setImmediate
