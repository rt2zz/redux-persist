`PersistGate` delays the rendering of your app's UI until your persisted state has been retrieved and saved to redux.

**NOTE**: the `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen), for example `loading={<Loading />}`.

Example usage:

```js
import { PersistGate } from 'redux-persist/es/integration/react'

import configureStore from './store/configureStore'

const { persistor, store } = configureStore()

const onBeforeLift = () => {
  // take some action before the gate lifts
}

export default () => (
  <Provider store={store}>
    <PersistGate 
      loading={<Loading />}
      onBeforeLift={onBeforeLift}
      persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
)
```
