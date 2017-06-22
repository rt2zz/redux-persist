// @flow
import React, { PureComponent } from 'react' // eslint-disable-line import/no-unresolved

import type { Persistor } from '../types'

type Props = {
  children?: any,
  loading: React.Element<any>,
  persistor: Persistor,
}

type State = {
  bootstrapped: boolean,
}

export class PersistGate extends PureComponent {
  props: Props
  state: State = {
    bootstrapped: false,
  }
  _unsubscribe: ?Function

  componentDidMount() {
    const { persistor } = this.props
    this._unsubscribe = this.props.persistor.subscribe(() => {
      let { bootstrapped } = persistor.getState()
      if (bootstrapped) {
        this.setState({ bootstrapped: true })
        this._unsubscribe && this._unsubscribe()
      }
    })
  }

  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe()
  }

  render() {
    return this.state.bootstrapped ? this.props.children : this.props.loading
  }
}
