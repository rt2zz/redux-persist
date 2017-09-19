// @flow


export default function createMemoryStorage() {
  let state = {}
  return {
    getItem (key: string) {
      return Promise.resolve(state[key])
    },
    setItem (key: string, value: any) {
      state[key] = value
      return Promise.resolve(value)
    },
    removeItem (key: string) {
      delete state[key]
      return Promise.resolve()
    }
  }
}