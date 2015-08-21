import { persistStore } from '../src/index'
import constants from '../src/constants'
import { createStore } from 'redux'
import createMemoryStorage from './mock/createMemoryStorage'

function createMockStore(opts) {
  return {
    subscribe: opts.subscribe || () => {},
    dispatch: opts.dispatch || () => {},
    getState: () => {
      return opts.mockState ? {...opts.mockState} : {}
    }
  }
}

describe('Scenarios', function() {
  it('Dispatch 2 REHYDRATE & 1 REHYDRATE_COMPLETE when restoring initialState: {foo:1, bar:2} storedState: {foo:1, bar:2}', function(done) {
    let rehydrateCount = 0
    let store = createMockStore({
      mockState: {foo:1, bar:2},
      dispatch: (action) => {
        if(action.type === constants.REHYDRATE){
          rehydrateCount++
        }
        if(action.type === constants.REHYDRATE_COMPLETE){
          if(rehydrateCount === 2){ done() }
          else{ throw new Error() }
        }
      }
    })

    persistStore(store, { storage: createMemoryStorage({[constants.keyPrefix+"foo"]:"1", [constants.keyPrefix+"bar"]:"2"}) })
  })

  it('Dispatch 0 REHYDRATE & 1 REHYDRATE_COMPLETE when restoring initialState: {} storedState: {foo:1, bar:2}', function(done) {
    let rehydrateCount = 0
    let store = createMockStore({
      mockState: {},
      dispatch: (action) => {
        if(action.type === constants.REHYDRATE){
          rehydrateCount++
        }
        if(action.type === constants.REHYDRATE_COMPLETE){
          if(rehydrateCount === 0){ done() }
          else{ throw new Error() }
        }
      }
    })

    persistStore(store, { storage: createMemoryStorage({[constants.keyPrefix+"foo"]:"1", [constants.keyPrefix+"bar"]:"2"}) })
  })

  it('Dispatch 0 REHYDRATE & 1 REHYDRATE_COMPLETE when restoring initialState: {foo:1, bar:2} storedState: {}', function(done) {
    let rehydrateCount = 0
    let store = createMockStore({
      mockState: {foo:1, bar:2},
      dispatch: (action) => {
        if(action.type === constants.REHYDRATE){
          rehydrateCount++
        }
        if(action.type === constants.REHYDRATE_COMPLETE){
          if(rehydrateCount === 0){ done() }
          else{ throw new Error() }
        }
      }
    })

    persistStore(store, { storage: createMemoryStorage({}) })
  })
})
