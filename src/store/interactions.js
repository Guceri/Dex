import Web3 from 'web3'
import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  exchangeLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded,
  orderCancelling,
  orderCancelled,
  orderFilling,
  orderFilled,
  etherBalanceLoaded,
  tokenBalanceLoaded,
  exchangeEtherBalanceLoaded,
  exchangeTokenBalanceLoaded,
  balancesLoaded,
  balancesLoading
} from './actions'
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { ETHER_ADDRESS } from './helpers'

export const loadWeb3 = async (dispatch) => {
  if(typeof window.ethereum!=='undefined'){
    const web3 = new Web3(window.ethereum)
    dispatch(web3Loaded(web3))
    return web3
  } else {
    window.alert('Please install MetaMask')
    window.location.assign("https://metamask.io/")
  }
}

export const loadAccount = async (web3, dispatch) => {
    const accounts = await web3.eth.getAccounts()
    const account = await accounts[0]

    if(typeof account !== 'undefined'){
      dispatch(web3AccountLoaded(account))
      return account
    } else {
      //make metaMask pop up to log into
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      return account
    }
}

export const loadToken = async (web3, networkId, dispatch) => {
  try {
    const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
    dispatch(tokenLoaded(token))
    return token
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select the <INSERT NETWORK> network with Metamask.')
    return null
  }
}

export const loadExchange = async (web3, networkId, dispatch) => {
  try {
    const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
    dispatch(exchangeLoaded(exchange))
    return exchange
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select <INSERT NETWORK>  network with Metamask.')
    return null
  }
}

export const loadAllOrders = async (exchange, dispatch) => {
  // Fetch cancelled orders with the "Cancel" event stream
  const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
  // Format cancelled orders
  const cancelledOrders = cancelStream.map((event) => event.returnValues)
  // Add cancelled orders to the redux store
  dispatch(cancelledOrdersLoaded(cancelledOrders))

  // Fetch filled orders with the "Trade" event stream
  const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
  // Format filled orders
  const filledOrders = tradeStream.map((event) => event.returnValues)
  // Add cancelled orders to the redux store
  dispatch(filledOrdersLoaded(filledOrders))

  // Load order stream
  const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0,  toBlock: 'latest' })
  // Format order stream
  const allOrders = orderStream.map((event) => event.returnValues)
  // Add open orders to the redux store
  dispatch(allOrdersLoaded(allOrders))
}

export const cancelOrder = (dispatch, exchange, order, account) => {
  exchange.methods.cancelOrder(order.id).send({ from: account })
  .on('transactionHash', (Hash) => {
    dispatch(orderCancelling())
  })
  .on('error', (error) => {
    console.log(error)
    window.alert('There was an error submitting order cancellation')
  })
}

export const subscribeToEvents = async (exchange, dispatch) => {
  let user, balance
  exchange.events.Cancel({}, (error, event) => {
    dispatch(orderCancelled(event.returnValues))
  })
  exchange.events.Trade({}, (error, event) => {
    dispatch(orderFilled(event.returnValues))
  })
  //TODO - deposit/withdraw can be for ETH or the token, might need adjusting to figure out what is being changed
  exchange.events.Deposit({}, (error, event) => {
    user = event.returnValues.user
    balance = Web3.utils.fromWei(event.returnValues.balance, 'ether')
    dispatch(balancesLoaded(user, balance))
  })
  exchange.events.Withdraw({}, (error, event) => {
    user = event.returnValues.user
    balance = Web3.utils.fromWei(event.returnValues.balance, 'ether')
    dispatch(balancesLoaded(user, balance))
  })
}

export const fillOrder = (dispatch, exchange, order, account) => {
  exchange.methods.fillOrder(order.id).send({ from: account })
  .on('transactionHash', (Hash) => {
    dispatch(orderFilling())
  })
  .on('error', (error) => {
    console.log(error)
    window.alert('There was an error submitting order')
  })
}

//TODO - figure out why the path of the smart contract addresses include 'options'
export const loadBalances = async (dispatch, web3, exchange, token, account) => {
  if(typeof account !== 'undefined') {
    //Pull all balance from both wallet and exchange and load them into redux
    // Ether balance in wallet
    const etherBalance = await web3.eth.getBalance(account)
    dispatch(etherBalanceLoaded(etherBalance))
    // Token balance in wallet
    const tokenBalance = await token.methods.balanceOf(account).call()
    dispatch(tokenBalanceLoaded(tokenBalance))
    // Ether balance in exchange
    const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
    dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))
    // Token balance in exchange 
    const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
    dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))
    // Trigger all balances loaded~
    dispatch(balancesLoaded())
  } else {
    window.alert('Please login with MetaMask')
  }
}

export const depositEther = (dispatch, exchange, web3, amount, account) => {
  //we need to convert value to wei
  exchange.methods.depositEther().send({ from: account,  value: web3.utils.toWei(amount, 'ether') })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    //4001 error is pressing the reject button on metamask confirmation
    if (error.code !== 4001){
      window.alert(`There was an error!`)
    }
  })
}

export const withdrawEther = (dispatch, exchange, web3, amount, account) => {
  exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    //4001 error is pressing the reject button on metamask confirmation
    if (error.code !== 4001){
      window.alert(`There was an error!`)
    }
  })
}

export const depositToken = (dispatch, exchange, web3, token, amount, account) => {
  amount = web3.utils.toWei(amount, 'ether')
  //with approval you only need the transactionHash to proceed with the transaction 
  //msg.sender is the exchange contract address
  //from is the metadata of who the transaction is for
  token.methods.approve(exchange.options.address, amount).send({ from: account })
  .on('transactionHash', (hash) => {
    exchange.methods.depositToken(token.options.address, amount).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error',(error) => {
      console.error(error)
      //4001 error is pressing the reject button on metamask confirmation
      if (error.code !== 4001){
        window.alert(`There was an error!`)
      }
    })
  })
}

export const withdrawToken = (dispatch, exchange, web3, token, amount, account) => {
  exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    //4001 error is pressing the reject button on metamask confirmation
    if (error.code !== 4001){
      window.alert(`There was an error!`)
    }
  })
}
