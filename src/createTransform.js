// @flow

type TransformConfig = {
  whitelist?: Array<string>,
  blacklist?: Array<string>,
}

export default function createTransform(
  // @NOTE inbound: transform state coming from redux on its way to being serialized and stored
  inbound: Function,
  // @NOTE outbound: transform state coming from storage, on its way to be rehydrated into redux
  outbound: Function,
  config: TransformConfig = {}
) {
  let whitelist = config.whitelist || null
  let blacklist = config.blacklist || null

  function whitelistBlacklistCheck(key) {
    if (whitelist && whitelist.indexOf(key) === -1) return true
    if (blacklist && blacklist.indexOf(key) !== -1) return true
    return false
  }

  return {
    in: (state: Object, key: string) =>
      !whitelistBlacklistCheck(key) && inbound ? inbound(state, key) : state,
    out: (state: Object, key: string) =>
      !whitelistBlacklistCheck(key) && outbound ? outbound(state, key) : state,
  }
}
