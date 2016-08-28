import createAsyncLocalStorage from './defaults/asyncLocalStorage'

export { autoRehydrate } from './autoRehydrate'
export { createPersistor } from './createPersistor'
export { createTransform } from './createTransform'
export { getStoredState } from './getStoredState'
export { persistStore } from './persistStore'
export { purgeStoredState } from './purgeStoredState'
export const storages = {
  asyncLocalStorage: createAsyncLocalStorage('local'),
  asyncSessionStorage: createAsyncLocalStorage('session')
}
