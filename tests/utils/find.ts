interface Collection {
  [key: string]: any;
}

export default (collection: Collection, predicate: any): any => {
  const result: Collection = {}
  Object.keys(collection).forEach(key => {
    if (predicate[key] === collection[key]) {
      result[key] = collection[key]
    }
  })
  return result
}
