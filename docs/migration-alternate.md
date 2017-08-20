## Alternate Migration
If in redux-persist you used getStoredState + createPersistor, the v5 usage is similar with some small modifications. Note: because no `persistor` is created the react integration helper `PersistGate` cannot be used.

1. replace `createPersistor` with `createPersistoid`
2. update persistoid whenever state changes

```js
import { getStoredState } from 'redux-persist/es/getStoredState'
import { createPersistoid } from 'redux-persist/es/createPersistoid'
import storage from 'redux-persist/es/storages/local'

// ...

const config = { key: 'root', version: 1, storage }

function configureStore () {
  const initState = await getStoredState(config)
  // createPersistoid instead of createPersistor
  let persistoid = createPersistoid(config)

  const store = createStore(reducer, initState)
 
  // need to hook up the subscription (this used to be done automatically by createPersistor)
  store.subscribe(() => {
    persistoid.update(store.getState())
  })
}
```