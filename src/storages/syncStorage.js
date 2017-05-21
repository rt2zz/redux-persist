import getStorage from './getStorage'

export default function (type, config) {
  let storage = getStorage(type)
  return {
    getItem: (key, cb) => cb(null, storage.getItem(key)),
    setItem: (key, item, cb) => {
    	try {
    		cb(null, storage.setItem(key, item))
    	} catch (err) {
    		cb(err)
    	}
    },
    removeItem: (key, cb) => cb(null, storage.removeItem(key)),
    getAllKeys: cb => cb(null, Object.keys(storage)),
  }
}
