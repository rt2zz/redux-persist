// @flow


export default function createMemoryStorage() {
  let state = {}
  return {
    getItem (key: string): Promise<string> {
      return Promise.resolve(state[key])
    },
    setItem (key: string, value: any): Promise<void> {
      state[key] = value
      return Promise.resolve(value)
    },
    removeItem (key: string): Promise<void> {
      delete state[key]
      return Promise.resolve()
    }
  }
}