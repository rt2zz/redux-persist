import isPlainObject from 'lodash/isPlainObject'

export default function isStatePlainEnough (a) {
  // isPlainObject + duck type not immutable
  if (!a) return false
  if (typeof a !== 'object') return false
  if (typeof a.asMutable === 'function') return false
  if (!isPlainObject(a)) return false
  return true
}
