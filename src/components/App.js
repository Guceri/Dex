import React, { Component } from 'react'
import './App.css'
import Web3 from 'web3'
import Navbar from './Navbar'
import Content from './Content'
import { connect } from 'react-redux' 
// used at the bottom to mapStateToProps
// allows use of this.props.dispatch inside render and also componentWillMount
import { loadWeb3, loadAccount, loadToken, loadExchange } from '../store/interactions' // function to call
import { contractsLoadedSelector} from '../store/selectors'


class App extends Component {

  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = loadWeb3(dispatch)
    await web3.eth.net.getNetworkType()
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3,dispatch)
    const token = await loadToken(web3, networkId, dispatch)
      if (!token){
        window.alert('Token smart contract not detected on the current network.  Please select another network with MetaMask.')
        return
      }
    const exchange = await loadExchange(web3, networkId, dispatch)
    if(!exchange){
      window.alert('Exchange smart contract not detected on the current network.  Please select another network with MetaMask.')
      return
    }
  }  

  render() {
    return (
      <div>
        <Navbar /> 
        { this.props.contractsLoaded ? <Content /> : <div className="content"></div>}
      </div>
    );
  }
}

//this allows us to use dispatch through this.props
function mapStateToProps(state) {
  return{
    contractsLoaded: contractsLoadedSelector(state)
  }
}
//connect is what connects  this component to redux
export default connect(mapStateToProps)(App);
