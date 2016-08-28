import createAsyncLocalStorage from './defaults/asyncLocalStorage'

import autoRehydrate from './autoRehydrate'
import createPersistor from './createPersistor'
import createTransform from './createTransform'
import getStoredState from './getStoredState'
import persistStore from './persistStore'
import purgeStoredState from './purgeStoredState'

const storageDeprecatedMessage = (type) => `
  To import async${type}Storage please import from 'redux-persist/storages'. For Example:
  \`import { async${type}Storage } from 'redux-persist/storages'\`
  or \`var async${type}Storage = require('redux-persist/storages').async${type}Storage\`
`

const storages = {
  asyncLocalStorage: createAsyncLocalStorage('local', { deprecated: storageDeprecatedMessage('Local') }),
  asyncSessionStorage: createAsyncLocalStorage('session', { deprecated: storageDeprecatedMessage('Session') })
}

export { autoRehydrate, createPersistor, createTransform, getStoredState, persistStore, purgeStoredState, storages }
