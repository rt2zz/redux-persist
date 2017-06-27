// @flow

import type { PersistConfig } from './types'

export default function stateReconciler<State: Object>(
  originalState: State,
  inboundState: State,
  reducedState: State,
  { debug }: PersistConfig
): State {
  if (process.env.NODE_ENV !== 'production')
    devKeyChecks(originalState, inboundState)

  let newState = { ...reducedState, ...inboundState }

  if (process.env.NODE_ENV !== 'production' && debug)
    console.log(
      `redux-p/stateReconciler: rehydrated keys '${Object.keys(
        inboundState
      ).join(', ')}'`
    )

  return newState
}

function devKeyChecks(originalState: Object, inboundState: Object) {
  if (!inboundState) return
  Object.keys(inboundState).forEach(key => {
    // check if initialState is missing a key
    if (!originalState.hasOwnProperty(key))
      console.log(
        `
      redux-p/stateReconciler: state missing key
      "${key}". state-manager will still store the rehydrated value. If you
      removed ${key} from your reducer tree, you should write a migration to
      remove ${key} from stored state. If you code-split ${key} reducer, then
      this is the expected behavior.
    `
      )

    // check recently added reducer properties that may require a migration
    if (
      typeof originalState[key] === 'object' &&
      typeof inboundState[key] === 'object'
    ) {
      const stateKeys = Object.keys(originalState[key])
      const inboundStateKeys = Object.keys(inboundState[key])
      stateKeys.forEach(checkKey => {
        if (inboundState[checkKey] === 'undefined')
          console.log(
            `
          redux-persist-state-manager/autoRehydrate: initialState for "${key}"
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
