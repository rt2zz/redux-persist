// @flow
import getStorage from './getStorage'

export default function createWebStorage(type: string) {
  let storage = getStorage(type)
  return {
    getItem: async (key: string) => {
      return storage.getItem(key)
    },
    setItem: async (key: string, item: string) => {
      return storage.setItem(key, item)
    },
    removeItem: async (key: string) => {
      return storage.removeItem(key)
    },
  }
}
