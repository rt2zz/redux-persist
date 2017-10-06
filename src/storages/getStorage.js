let noStorage = () => () => { /* noop */ return null }
if (process.env.NODE_ENV !== 'production') {
  let warned = false
  noStorage = (storageType) => () => {
  	if (warned) {
  		return null
  	}
  	warned = true
    console.error(`redux-persist storage requires a global ${storageType} object. Either use a different storage backend or if this is a universal redux application you probably should conditionally persist like so: https://gist.github.com/rt2zz/ac9eb396793f95ff3c3b`)
    return null
  }
}

function hasStorage(storageType) {
  if (typeof window !== 'object' || !(storageType in window)) {
    return false
  }

  try {
    let storage = window[storageType]
    const testKey = `redux-persist ${storageType} test`
    storage.setItem(testKey, 'test')
    storage.getItem(testKey)
    storage.removeItem(testKey)
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn(`redux-persist ${storageType} test failed, persistence will be disabled.`)
    return false
  }
  return true
}

export default function getStorage (type) {
  const storageType = `${storageType}Storage`
  if (hasStorage(storageType)) {
  	return window[storageType]
  }
  const noStorageType = noStorage(storageType)
  return { getItem: noStorageType, setItem: noStorageType, removeItem: noStorageType, getAllKeys: noStorageType }
}
