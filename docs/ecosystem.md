## Redux Persist Ecosystem
### Storage Engines
- **localStorage**
- **sessionStorage**
- **[localForage](https://github.com/mozilla/localForage)** (recommended) web, see usage below
- **[AsyncStorage](http://facebook.github.io/react-native/docs/asyncstorage.html#content)** for react-native
- **[redux-persist-node-storage](https://github.com/pellejacobs/redux-persist-node-storage)** for use in nodejs environments.
- **[redux-persist-memory-storage](https://github.com/modosc/redux-persist-memory-storage)** simple memory store
- **[redux-persist-react-native-fs](https://github.com/netbeast/redux-persist-react-native-fs)** uses react-native file system as engine

### Transforms
- [**immutable**](https://github.com/rt2zz/redux-persist-transform-immutable) - support immutable reducers
- [**compress**](https://github.com/rt2zz/redux-persist-transform-compress) - compress your serialized state with lz-string
- [**encrypt**](https://github.com/maxdeviant/redux-persist-transform-encrypt) - encrypt your serialized state with AES
- [**filter**](https://github.com/edy/redux-persist-transform-filter) - store or load a subset of your state

### Extensions
- [**redux-persist-migrate**](https://github.com/wildlifela/redux-persist-migrate)
