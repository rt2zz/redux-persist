module.exports = {
  keyPrefix: 'reduxPersist:',
  actionMeta: {
    rehydrate: 'reduxPersistRehydration',
    complete: 'reduxPersistRehydrationComplete'
  },
  REHYDRATE: 'persist/REHYDRATE',
  REHYDRATE_COMPLETE: 'persist/COMPLETE'
}
