React Native Example Usage.

1. Setup [PersistGate](./PersistGate.md) as starting point of your application.
2. To Configure Store follow the [Usage](../README.md#usage).
3. Redux integration

```js
<!-- Action-->
export default const loginUser = () => ({ type: 'LOGIN_USER' })

<!-- Reducer -->
const authReducer = (state = {}, action) => {
  if(action.type === 'LOGIN_USER')
    return Object.assign({}, state, { authenticated: true })

  return { authenticated: false }
}

export default {
  auth: authReducer
}
<!-- Store.js -->
...
import reducers from './reducers'
...

<!-- App.js -->
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import actions from './actions'

class App extends Component {
  render() {
    const { authenticated } = this.props.auth.authenticated

    if(authenticated) {
      return (
        <View style={styles.container}>
          <Text>You are logged in</Text>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Button
          title="Login"
          onPress={() => this.props.loginUser()}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
    alignItems: 'center',
    justifyContents: 'center'
  }
})

const mapStateToProps = ({ auth }) => {
  return {
    auth
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  loginUser: actions.loginUser
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Login)
```

4. Run your application and click login. On successfull view change reload your application and you should see the updated screen. This means your last state has been persisted(in AsyncStorage).
