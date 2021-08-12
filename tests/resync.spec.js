// @flow

import test from 'ava'

import _ from 'lodash'
import { createStore } from 'redux'

import getStoredState from '../src/getStoredState'
import persistReducer from '../src/persistReducer'
import persistStore from '../src/persistStore'
import { createMemoryStorage } from 'storage-memory'

const initialState = { a: 0 }
const persistObj = {
  version: 1,
  rehydrated: true
};

let reducer = (state = initialState, { type }) => {
  console.log('action', type)
  if (type === 'INCREMENT') {
    return _.mapValues(state, v => v + 1)
  }
  return state
}

const memoryStorage = createMemoryStorage()

const config = {
  key: 'resync-reducer-test',
  version: 1,
  storage: memoryStorage,
  debug: true,
  throttle: 1000,
}

test('state is resync from storage', t => {
  return new Promise((resolve, reject) => {
    let rootReducer = persistReducer(config, reducer)
    const store = createStore(rootReducer)

    const persistor = persistStore(store, {}, async () => {

      // 1) Make sure redux-persist and storage are in the same state

      await persistor.flush();
      let storagePreModify = await getStoredState(config)

      const oldStorageState = {
        ...initialState,
        _persist: persistObj,
      };
      t.deepEqual(
        storagePreModify,
        oldStorageState
      )

      // 2) Change the storage directly (so redux-persist won't notice it changed)

      const newStorageValue = {
        a: 1, // override the value of a
        _persist: JSON.stringify(persistObj),
      }
      await memoryStorage.setItem(`persist:${config.key}`, JSON.stringify(newStorageValue));
      let storagePostModify = await getStoredState(config)

      // 3) Call resync and make sure redux-persist state was overriden by storage content

      await persistor.resync();
      t.deepEqual(
        storagePostModify,
        {
          a: 1,
          _persist: persistObj,
        }
      )

      resolve()
    })
  })
})
