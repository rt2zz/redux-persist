// @flow
import getStorage from './getStorage'

export default function createWebStorage(type: string) {
  let storage = getStorage(type)
  return {
    getItem: (key: string) => {
      return new Promise((resolve, reject) => {
        resolve(storage.getItem(key))
      })
    },
    setItem: (key: string, item: string) => {
      return new Promise((resolve, reject) => {
        resolve(storage.setItem(key, item))
      })
    },
    removeItem: (key: string) => {
      return new Promise((resolve, reject) => {
        resolve(storage.removeItem(key))
      })
    },
  }
}
