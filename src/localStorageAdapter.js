export default {
  getItem: function(key, cb){
    try{
      var s = localStorage.getItem(key)
    }
    catch(e){
      cb(e)
      return
    }
    cb(null, s)
  },
  setItem: function(key, string, cb){
    try{
      localStorage.setItem(key, string)
    }
    catch(e){
      cb(e)
      return
    }
    cb(null)
  },
  removeItem: function(key, cb){
    try{
      localStorage.removeItem(key)
    }
    catch(e){
      cb(e)
      return
    }
    cb(null)
  },
  getAllKeys: function(cb){
    try{
      var keys = []
      for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        keys.push(localStorage.key(i))
      }
    }
    catch(e){
      cb(e)
      return
    }
    cb(null, keys)
  }
}
