// @flow

export default function (timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout)
  })
}