// @flow

import type { PersistConfig } from './types'

export default function stateReconciler<State: Object>(
  originalState: State,
  inboundState: State,
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
      // if reducer modifies substate, skip auto rehydration
      if (originalState[key] !== reducedState[key]) {
        if (process.env.NODE_ENV !== 'production' && debug)
          console.log(
            'redux-persist/stateReconciler: sub state for key `%s` modified, skipping.',
            key
          )
        return
      }
      // otherwise hard set the new value
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
