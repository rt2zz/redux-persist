import test from 'ava'

import { createStore } from 'redux'

import createPersistor from '../src/createPersistor'
import createMemoryStorage from './helpers/createMemoryStorage'

test.cb('exposes a flush method', t => {
  const initialState = { foo: { value: 'bar' } }
  const store = createStore(s => s, initialState)
  const storage = createMemoryStorage({})
  const persistor = createPersistor(store, { storage, keyPrefix: 'test:' })

  storage.getItem('test:foo', (err, initialValue) => {
    t.falsy(err)
    t.falsy(initialValue)
    persistor.flush()

    storage.getItem('test:foo', (err, value) => {
      t.falsy(err)
      t.deepEqual(JSON.parse(value), { value: 'bar' })
      t.end()
    })
  })
})
