## Code splitting

With code splitting, we can load only needed in given moment chunks of code used by an application.

We already used `replaceReducer` when we talked about HMR.

This function is required to replace old reducer with newly created reducer which includes dynamically injected ones.

Code splitting is described well at https://redux.js.org/recipes/code-splitting.

**configureStore.js**
```js
import { persistReducer } from 'redux-persist'
import rootReducer from './path/to/reducer'

// Static reducers...

export default () => {
  // ...

  const store = createStore(
    // createReducer returns static reducers combined with injected ones
    createReducer({ /* here without async (dynamic) reducers */ }),
    initialState,
    composeEnhancers(...enhancers),
  );

  // Async reducers registry (in react-boilerplate they are called injected reducers)
  // Here we track dynamically injected reducers
  store.asyncReducers = {};

  const persistor = persistStore(store, null, () => {
    // Get persisted state
    Object.keys(store.getState())
      // We always have static reducers loaded
      .filter(reducerKey => !Object.keys(staticReducers).includes(reducerKey))
      .forEach(reducerKey => {
        // Create empty reducers for keys that don't have loaded dynamic reducer yet
        // They will be replaced be a real ones.
        store.asyncReducers[reducerKey] = (state = null) => state;
      });
  });
  store.persistor = persistor;

  // Some method like injectReducer which adds async reducer to registry...

  // HMR...

  return { store, persistor }
}
```
