function makeAdapter() {
  let resolve, reject

  return {
    callback: (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    },
    promise: new Promise((resolveIn, rejectIn) => {
      resolve = resolveIn
      reject = rejectIn
    })
  }
}

export default makeAdapter
