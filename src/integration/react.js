// @flow
import React, { PureComponent } from 'react' // eslint-disable-line import/no-unresolved

import type { Persistor } from '../types'

type Props = {
  onBeforeLift?: Function,
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
    this.handlePersistorState()
    this._unsubscribe = this.props.persistor.subscribe(
      this.handlePersistorState
    )
  }

  handlePersistorState = () => {
    const { persistor } = this.props
    let { bootstrapped } = persistor.getState()
    if (bootstrapped) {
      this.props.onBeforeLift && this.props.onBeforeLift()
      this.setState({ bootstrapped: true })
      this._unsubscribe && this._unsubscribe()
    }
  }

  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe()
  }

  render() {
    return this.state.bootstrapped ? this.props.children : this.props.loading
  }
}
