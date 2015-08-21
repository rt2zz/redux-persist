import { persistStore } from '../src/persistStore'
import { createStore } from 'redux'

const initialState = { counter: 0 }
const reducer = (state = initialState, action) =>{
  state = {...state, actionCounter: state.actionCounter+1}
}

//@TODO how to test actions get fired? how to mock localstorage in testing?

// describe('Restore From LocalStorage', function() {
//   it('should fire complete action when finished', function(done) {
//     let store = createStore(reducer)
//     persistStore(store)
//
//   })
// })
