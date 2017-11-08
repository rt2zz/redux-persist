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
  // various dev only sanity checks
  if (process.env.NODE_ENV !== 'production') {
    if (inboundState) {
      Object.keys(inboundState).forEach(key => {
        // check if initialState is missing a key
        if (!originalState.hasOwnProperty(key))
          console.log(
            `
          redux-persist/stateReconciler: state missing key
          "${key}". state-manager will still store the rehydrated value. If you
          removed ${key} from your reducer tree, you should write a migration to
          remove ${key} from stored state. If you code-split ${key} reducer, then
          this is the expected behavior.
        `
          )

        // check recently added reducer properties that may require a migration
        if (
          originalState[key] &&
          typeof originalState[key] === 'object' &&
          inboundState[key] &&
          typeof inboundState[key] === 'object'
        ) {
          const stateKeys = originalState[key]
            ? Object.keys(originalState[key])
            : []
          const inboundStateKeys = Object.keys(inboundState[key])
          stateKeys.forEach(checkKey => {
            if (inboundState[checkKey] === 'undefined')
              console.log(
                `
              redux-persist/stateReconciler: initialState for "${key}"
              has property "${checkKey}" which is missing in rehydratedState. After
              rehydration, "${checkKey}" will be null. If you recently added
              ${checkKey} to your ${key} reducer, consider adding ${checkKey} to a
              state migration.
            `
              )
          })
        }
      })
    }
  }

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
        newState[key] = { ...newState[key], ...inboundState[key] }
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
