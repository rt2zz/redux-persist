# Redux Persist
Persist and rehydrate a redux store.

Redux Persist is [performant](#performance), easy to [implement](#basic-usage), and easy to [extend](#extend-and-customize).

Check out some [recipes](https://github.com/rt2zz/redux-persist/blob/master/docs/recipes.md), or open an issue to discuss your use case.

## Basic Usage
Basic usage requires adding three lines to a traditional redux application:
```js
import { persistStore, autoRehydrate } from 'redux-persist'
const store = compose(autoRehydrate())(createStore)(reducer)
persistStore(store)
```
For more complex rehydration, like restoring immutable data, add a handler to your reducer:
```js
import {REHYDRATE} from 'redux-persist/constants'
//...
case REHYDRATE:
  if(action.key === 'myReducer'){
    //restore immutable data
    let someList = Immutable.List(action.payload.someList)
    return {...state, ...action.payload, someList}
  }
  return state
```
You may also need to configure the persistence layer, or take action after rehydration has completed:
```js
persistStore(store, {blacklist: ['someTransientReducer']}, () => {
  console.log('rehydration complete')
})
```
And if things get out of wack, just purge the storage
```js
persistStore(store, config, callback).purge(['someReducer']) //or .purgeAll()
```

## Rationale

* Performant out of the box (uses a time iterator and operates on state partials)
* Keeps custom rehydration logic in the reducers (where it intuitively belongs)
* Supports localStorage, react-native AsyncStorage, or any conforming storage api

The core idea behind redux-persist is to provide performant persistence and rehydration methods. At the same time redux-persist is designed to minimize complexity by knowing as little about your application as possible.

Conceptually redux-persist encourages you to think on a per-reducer basis. This greatly simplifies the mental model (no filters or selectors!) and means that if you change your reducer schema, you will not need to mirror those changes in your persistence configuration.

Because persisting state is inherently stateful, `persistStore` lives outside of the redux store. Importantly this keeps the store 'pure' and makes testing and extending the persistor much easier.

## API
- `persistStore(store, [config, callback])`
  - **store** *redux store* The store to be persisted.
  - **config** *object*
    - **blacklist** *array* keys (read: reducers) to ignore
      **whitelist** *array* keys (read: reducers) to persist, if set all other keys will be ignored.
    - **actionCreator** *action creator* The rehydrate action creator. absent will use a default action creator which returns: `{ key, payload, type: 'REHYDRATE'}`
    - **storage** *object* An object with the following methods implemented `setItem(key, string, cb)` `getItem(key, cb)` `removeItem(key, cb)`
    - **transforms** *array* transforms to be applied during storage and during rehydration.
  - **callback** *function* Will be called after rehydration is finished.

- `autoRehydrate`
  - This is a store enhancer that will automatically shallow merge the persisted state for each key. Additionally it queues any actions that are dispatched before rehydration is complete, and fires them after rehydration is finished.

- `.purge(keys)`
  - **keys** *array* An array of keys to be purged from local storage. (this method is available on the return value of persistStore)

- `.purgeAll()`
  -  Purges all keys. (this method is available on the return value of persistStore)

- `constants`
  - `import constants from 'redux-persist/constants'`. This includes rehydration action types, and other relevant constants.

## Extend And Customize
Redux-persist is very easy to extend with new functionality:
* ImmutableJS support with [redux-persist-immutable](https://github.com/rt2zz/redux-persist-immutable)
* Cross tab syncing with [redux-persist-crosstab](https://github.com/rt2zz/redux-persist-crosstab)

#### Example
```js
import reduxPersistImmutable from 'redux-persist-immutable'
import crosstabSync from 'redux-persist-crosstab'

const persistor = persistStore(store, {transforms: [reduxPersistImmutable]})
crosstabSync(persistor)
```

## Storage Backends
**localStorage** (default), react-native **AsyncStorage**, or a conforming **custom** storage api. Custom storage API should be an object with the following methods: `setItem` `getItem` `removeItem` `getAllKeys` each with the function signature as found in [react-native AsyncStorage](http://facebook.github.io/react-native/docs/asyncstorage.html#content).

```js
import AsyncStorage from 'react-native'
persistStore(store, {storage: AsyncStorage})
```

## About Auto Rehydrate
autoRehydrate is a store enhancer that automatically rehydrates state.

While auto rehydration works out of the box, individual reducers can opt in to handling their own rehydration, allowing for more complex operations like data transforms and cache invalidation. Simply define a handler for the rehydrate action in your reducer, and if the state is mutated, auto rehydrate will skip that key.

With autoRehydrate, actions dispatched before rehydration is complete are buffered and released immediately after rehydration is complete.

Auto rehydrate is provided as a convenience. In a large application, or one with atypical reducer composition, auto rehydration may not be convenient. In this case, simply omit autoRehydrate. Rehydration actions will still be fired by `persistStore`, and can then be handled individually by reducers or using a custom rehydration handler.

## Performance
JSON serialization and localStorage (which is sync!) can both hurt performance. To work around this redux-persist implements a few performance tricks:
* **During Rehydration** getItem calls are invoked once per key using setImmediate.  
* **During Storage** setItem calls are invoked only on keys whose state has changed, using a time iterator one key every 33 ms (i.e. 30fps)  

Additionally redux persist operates on a per reducer basis, which is a great lever for maximizing performance. If a piece of state is changing often (10+ times per second), isolate that state into it's own reducer, which will make the serialization and storage operations much faster.
