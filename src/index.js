import autoRehydrate from './autoRehydrate'
import createPersistor from './createPersistor'
import createTransform from './createTransform'
import getStoredState from './getStoredState'
import persistStore from './persistStore'
import purgeStoredState from './purgeStoredState'

// @TODO remove in v5
const deprecated = (cb, cb2, cb3) => {
  console.error('redux-persist: this method of importing storages has been removed. instead use `import { asyncLocalStorage } from "redux-persist/storages"`')
  if (typeof cb === 'function') cb()
  if (typeof cb2 === 'function') cb2()
  if (typeof cb3 === 'function') cb3()
}
const deprecatedStorage = { getAllKeys: deprecated, getItem: deprecated, setItem: deprecated, removeItem: deprecated }
const storages = {
  asyncLocalStorage: deprecatedStorage,
  asyncSessionStorage: deprecatedStorage
}

export { autoRehydrate, createPersistor, createTransform, getStoredState, persistStore, purgeStoredState, storages }
