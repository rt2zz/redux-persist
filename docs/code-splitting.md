## Code splitting

With code splitting, we can load chunks of code needed only at a given moment.

We already used `replaceReducer` when we talked about HMR.

This function is required to replace an old reducer with a newly created that includes dynamically injected ones.

Code splitting is described well at https://redux.js.org/recipes/code-splitting and http://nicolasgallagher.com/redux-modules-and-code-splitting/.

The code below is basing on the react-boilerplate:

**app.js**
```js
// ...

getStoredState(persistConfig).then(initialState => {
  const store = configureStore(initialState, history);

  const render = (/* ... */) => {
    ReactDOM.render(
      <Provider store={store}>
        ...
          <PersistGate loading={/* ... */} persistor={store.persistor}>
            <App />
          </PersistGate>
        ...
      </Provider>,
      MOUNT_NODE,
    );
  };

  // ...
  // render(...)
});

// ...
```

**reducers.js**
```js
// redux-persist config, staticReducers, staticReducersKeys

export default function createReducer(injectedReducers = {}) {
  const reducers = {
    ...staticReducers,
    ...injectedReducers,
  };

  return persistCombineReducers(rootPersistConfig, reducers);
}

// ...
```

**configureStore.js**
```js
// Imports

export default function configureStore(initialState = {}, history) {
  // ...

  const dumbReducers = Object.keys(initialState)
    // We always have static reducers loaded
    .filter(reducerKey => !staticReducersKeys.includes(reducerKey))
    .reduce((result, reducerKey) => {
      // Create empty reducers for keys that don't have loaded dynamic reducer yet
      // They will be replaced by the real one
      result[reducerKey] = (state = null) => state;

      return result;
    }, {});

  const store = createStore(
    createReducer(dumbReducers),
    {},
    /* Enhancers */,
  );

  // ...

  // Here we track dynamically injected reducers
  store.injectedReducers = { ...dumbReducers };

  // Saga registry
  store.injectedSagas = {};

  // redux-persist
  const persistor = persistStore(store, null);
  store.persistor = persistor;
  persistor.persist();

  // ...

  return store;
}
```

**reducerInjectors.js**
```js
// ...

    store.replaceReducer(createReducer(store.injectedReducers));

    if (store.dispatch) {
      store.persistor.persist();
    }

// ...
```
