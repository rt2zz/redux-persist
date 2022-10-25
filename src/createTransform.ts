/* eslint-disable @typescript-eslint/no-explicit-any */
type TransformConfig = {
  allowlist?: Array<string>,
  denylist?: Array<string>,
}

export default function createTransform(
  // @NOTE inbound: transform state coming from redux on its way to being serialized and stored
  // eslint-disable-next-line @typescript-eslint/ban-types
  inbound: Function,
  // @NOTE outbound: transform state coming from storage, on its way to be rehydrated into redux
  // eslint-disable-next-line @typescript-eslint/ban-types
  outbound: Function,
  config: TransformConfig = {}
): any {
  const allowlist = config.allowlist || null
  const denylist = config.denylist || null

  function allowlistDenylistCheck(key: string) {
    if (allowlist && allowlist.indexOf(key) === -1) return true
    if (denylist && denylist.indexOf(key) !== -1) return true
    return false
  }

  return {
    in: (state: Record<string, unknown>, key: string, fullState: Record<string, unknown>) =>
      !allowlistDenylistCheck(key) && inbound
        ? inbound(state, key, fullState)
        : state,
    out: (state: Record<string, unknown>, key: string, fullState: Record<string, unknown>) =>
      !allowlistDenylistCheck(key) && outbound
        ? outbound(state, key, fullState)
        : state,
  }
}
