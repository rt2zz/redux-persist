// @flow

type TransformConfig = {
  allowedlist?: Array<string>,
  avoidlist?: Array<string>,
}

export default function createTransform(
  // @NOTE inbound: transform state coming from redux on its way to being serialized and stored
  inbound: ?Function,
  // @NOTE outbound: transform state coming from storage, on its way to be rehydrated into redux
  outbound: ?Function,
  config: TransformConfig = {}
) {
  let allowedlist = config.allowedlist || null
  let avoidlist = config.avoidlist || null

  function allowedlistAvoidListCheck(key) {
    if (allowedlist && allowedlist.indexOf(key) === -1) return true
    if (avoidlist && avoidlist.indexOf(key) !== -1) return true
    return false
  }

  return {
    in: (state: Object, key: string, fullState: Object) =>
      !allowedlistAvoidListCheck(key) && inbound
        ? inbound(state, key, fullState)
        : state,
    out: (state: Object, key: string, fullState: Object) =>
      !allowedlistAvoidListCheck(key) && outbound
        ? outbound(state, key, fullState)
        : state,
  }
}
