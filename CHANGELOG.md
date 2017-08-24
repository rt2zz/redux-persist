# 4.9.1

- update Flow definition of `persistStore()` to mark `config` as an optional argument [#421](https://github.com/rt2zz/redux-persist/pull/421)

# 4.9.0

- if the dispatch of `rehydrateAction` causes an exception, resume `persistStore()`. Previously, it would pause indefinitely, causing state not to be persisted. [#390](https://github.com/rt2zz/redux-persist/pull/390)
