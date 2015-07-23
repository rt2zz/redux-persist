'use strict'

var _ = require('lodash')

exports['default'] = persistStore

function persistStore(store, rules, actionCreator){
  console.log('persist')
  rules = rules || {}

  actionCreator = actionCreator || function(key, data){
    return {
      type: 'REHYDRATE',
      reducer: key,
      data: data,
    }
  }

  var timeIterator = null
  var lastState = store.getState()


  console.log('init', lastState, _)
  _.each(lastState, function(subState, key){
    if(rules[key] === false){ return }
    let serialized = localStorage.getItem('reduxPersistStore:'+key)
    let data = JSON.parse(serialized)
    store.dispatch(actionCreator(key, data))
  })

  var unsub = store.subscribe(function(){

    if(timeIterator !== null){
      clearInterval(timeIterator)
    }

    let state = store.getState()
    let storesToProcess = _.filter(_.map(state, function(subState, key){
      if(rules[key] === false){ return }
      return lastState[key] !== state[key] ? key : false
    }))
    console.log('stores to process', storesToProcess)

    let i = 0
    var timeIterator = setInterval(function(){
      if(i === storesToProcess.length){
        clearInterval(timeIterator)
        return
      }
      localStorage.setItem('reduxPersistStore:'+storesToProcess[i], JSON.stringify(state[storesToProcess[i]]))
      i += 1
    }, 33)

    lastState = state
  })
}

module.exports = exports['default']
