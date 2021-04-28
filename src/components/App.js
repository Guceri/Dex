import React, { Component } from 'react'
import './App.css'
import Navbar from './Navbar'
import Content from './Content'
import { connect } from 'react-redux'
import {
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange
} from '../store/interactions'
import { contractsLoadedSelector } from '../store/selectors'

class App extends Component {
  UNSAFE_componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    //refresh page on network change event
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });

    //refresh user account on account change event
    window.ethereum.on('accountsChanged', () => {
      loadAccount(web3, dispatch) //returns account
    });

    const web3 = await loadWeb3(dispatch)

    const networkId = await web3.eth.net.getId()

    await loadAccount(web3, dispatch)

    const token = await loadToken(web3, networkId, dispatch)
    if(!token) {
      window.alert('Token smart contract not detected on the current network. Please select another network with Metamask.')
      return
    }
    const exchange = await loadExchange(web3, networkId, dispatch)
    if(!exchange) {
      window.alert('Exchange smart contract not detected on the current network. Please select another network with Metamask.')
      return
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ? < Content/> : <div className="content"></div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state)//bool
  }
}

export default connect(mapStateToProps)(App)
