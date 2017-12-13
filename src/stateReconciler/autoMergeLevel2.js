// @flow

/*
  autoMergeLevel2: 
    - merges 2 level of substate
    - skips substate if already modified
    - this is essentially redux-perist v4 behavior
*/

import type { PersistConfig } from '../types'

export default function autoMergeLevel2<State: Object>(
  inboundState: State,
  originalState: State,
  reducedState: State,
  { debug }: PersistConfig
): State {
  let newState = { ...reducedState }
  // only rehydrate if inboundState exists and is an object
  if (inboundState && typeof inboundState === 'object') {
    Object.keys(inboundState).forEach(key => {
      // ignore _persist data
      if (key === '_persist') return
      // if reducer modifies substate, skip auto rehydration
      if (originalState[key] !== reducedState[key]) {
        if (process.env.NODE_ENV !== 'production' && debug)
          console.log(
            'redux-persist/stateReconciler: sub state for key `%s` modified, skipping.',
            key
          )
        return
      }
      if (isPlainEnoughObject(reducedState[key])) {
        // if object is plain enough shallow merge the new values (hence "Level2")
        Object.keys(inboundState[key]).forEach(prop => {
          // if the newState doesn't have the stored prop, skip it
          if(!newState[key].hasOwnProperty(prop)) return;

          const newPropType = typeof newState[key][prop];
          const inboundPropType = typeof inboundState[key][prop];

          // if the inboundState has the same Level2 prop and it's the same type then merge it. Otherwise skip it.
          if(newPropType === inboundPropType) {
            newState[key][prop] = inboundState[key][prop];
          } else if (process.env.NODE_ENV !== 'production' && debug)
            console.log(
              'redux-persist/stateReconciler: sub state for key `%s` under prop `%s` has mismatching type (`%s` vs `%s`), skipping.',
              key,
              prop,
              newPropType,
              inboundPropType
            )
          }
        });
        return
      }
      // otherwise hard set
      newState[key] = inboundState[key]
    })
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    debug &&
    inboundState &&
    typeof inboundState === 'object'
  )
    console.log(
      `redux-persist/stateReconciler: rehydrated keys '${Object.keys(
        inboundState
      ).join(', ')}'`
    )

  return newState
}

function isPlainEnoughObject(o) {
  return o !== null && !Array.isArray(o) && typeof o === 'object'
}
