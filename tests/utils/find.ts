export default (collection: any, predicate: any): any => {
  const result = {}
  Object.keys(collection).forEach(key => {
    if (predicate[key] === collection[key]) {
      result[key] = collection[key]
    }
  })
  return result
}
