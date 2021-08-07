export default (collection: Array<any>, predicate: any): any => {
  let result = {}
  collection.forEach((value: any) => {
    if (value.type && value.type === predicate.type) {
      result = value
    }
  })
  return result
}
