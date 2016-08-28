import test from 'ava'

import { purgeStoredState, storages } from '../src'

test('purgeStoredState (all) returns a promise', t => {
  let purgeResult = purgeStoredState({ storage: storages.asyncLocalStorage })
  t.true(isPromise(purgeResult))
  return purgeResult
})

test('purgeStoredState (whitelist) returns a promise', t => {
  let purgeResult = purgeStoredState({ storage: storages.asyncLocalStorage }, ['foo'])
  t.true(isPromise(purgeResult))
  return purgeResult
})

function isPromise (something) {
  return typeof something === 'object' && typeof something.then === 'function'
}
