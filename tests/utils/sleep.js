// @flow

export default function (timeout: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout)
  })
}