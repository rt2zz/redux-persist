This is WIP documentation for a major api change proposed for redux-persist. You can install this via `npm i redux-persist@proto`.

### Open Questions
- naming
  - createPersistoid
    - this is the stateful object that actually does the serialization and writing out of state (per persistReducer). Other names could be `createPersistNode` or `createSink`.
  - config.migrate
    - this is an optional async method to transform state after retrieval but before rehydration. The anticipated usage is for migrations, but technically it is not limited to this. Perhaps the name should be more general.
- performance related to workaround for combineReducers warning
  
### Usage
```js
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/es/storage'
import rootReducer from './rootReducer'

const config = {
  key: 'root', // key is required
  storage, // storage is now required
}

const reducer = persistReducer(config, rootReducer)

function configureStore () {
  // ...
  let store = createStore(reducer)

  persistStore(store)
}
```

**Alternate Usage**
If in redux-persist you used getStoredState + createPersistor, the usage is nearly identical with some minor modifications. Note: because no `persistor` is created, `react/PersistGate` cannot be used.
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
### P2 Proto Overview
This is a prototype for a new version of redux-persist that fundamentally changes the architecture. These changes are largely motivated by the desire to better support
- HMR of store files
- Code Splitting of reducers
- Easier to integration for parent dependencies (e.g. redux-offline)
- Possible to nest persistence
- Possible to colocate persistence rules with the reducers they persist
- Ability to provide a `<PersistGate>` component which blocks render until persistence is complete.

In the course of designing for these objectives a few other benefits fell out
- gaurantee consistent state atoms
  - before we serialized *and* stored the state on a per key basis
  - now we serialize per key, but store all keys together, eliminating the possibility of having some keys updated on disk while others are not.
- Better debugability and extensibility (more on that below)

### Key Architecture Changes
- persistor vs. persistoid
  - whereas the `persistor` used to both handle storing of state *and* provide persistence interface, now that role is split up, `persistor` handles control (e.g. start & purge) while `persistoid` handles the actual storing of state. - Rather than creating multiple persistors as was common in redux-persist@4, now there will typically only be 1 persistor, with potentially many persistoids.
  - In a sense as store is to reducer, persistor is to persistoid
- persistor is a redux store
  - turns out redux is a great way to handle state machines, and the persistor is exactly that
  - persistor handles two action types: REGISTER (for persistoids to register their existence) and REHYDRATE (for persistoids to notify they have completed rehydration)
- state versioning and version migration is now built in to the lib

### What magic is this?
Actually there is no magic, but it does require sending a register method attached to the new PERSIST action. Functions in actions (i.e. non serializable)has a bad smell, but it is reasonable in this case as this action should never affect store state. In fact I think we might make the action type a non-exported Symbol so that it is impossible to use this action externally.

### What can it not do?
I am not sure what the migration story would look like for users of redux-perist@4 who use getStoredState + createPersistor directly. It may require a change in approach - hopefully with no loss of functionality.

It also does not work with top level immutable state, and I am not sure if it ever will. We take more liberties around storing persist meta in the store's state and handling migrations. While it could be pluggable, I am concerned the effort and indirection will not be worthwhile. Open to discussion.

### Does this make testing harder?
I am not certain yet, but I expect it to have no impact on testing. If you wrap a reducer with `persistReducer` the higher order function is a noop until it receives a PERSIST action. So long as you do not fire PERSIST (i.e. attach `persistStore`) in your tests, nothing should change.

### TODO
- more tests
- use it in production
- commonjs build
- what is best pattern for exports that still preserves code splitability. Right now everything is required to be imported deeply.
- decide if rehydration should do hard set or shallow merge by default, and if this needs to be configurable
