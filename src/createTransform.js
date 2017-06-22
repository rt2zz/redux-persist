// @flow

type TransformConfig = {
  whitelist?: Array<string>,
  blacklist?: Array<string>,
}

export default function createTransform(
  inbound: Function,
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
