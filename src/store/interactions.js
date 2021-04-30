import Web3 from 'web3'
import {
  web3Loaded,
  networkLoaded,
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
  ethBalancesLoaded,
  tokenBalancesLoaded,
  ethBalancesLoading,
  tokenBalancesLoading,
  buyOrderMaking,
  sellOrderMaking,
  orderMade
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

export const loadNetworkId = async (web3, dispatch) => {
  const networkId = await web3.eth.net.getId()
  dispatch(networkLoaded(networkId))
  return networkId
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
    console.log('Contract not deployed to the current network. Please select the Rinkeby network with Metamask.')
    return null
  }
}

export const loadExchange = async (web3, networkId, dispatch) => {
  try {
    const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
    dispatch(exchangeLoaded(exchange))
    return exchange
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select Rinkeby network with Metamask.')
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

export const subscribeToEvents = async (web3, account, networkId, exchange, token, dispatch) => {

  let user, depositToken, withdrawToken, exchangeBalance,  walletBalance

  exchange.events.Cancel({}, (error, event) => {
    dispatch(orderCancelled(event.returnValues))
  })
  exchange.events.Trade({}, (error, event) => {
    dispatch(orderFilled(event.returnValues))
  })

  exchange.events.Deposit({}, async (error, event) => {
    user = event.returnValues.user //user account
    depositToken = event.returnValues.token //address of token
    exchangeBalance = event.returnValues.balance //balance of user on the exchange

    //Eth Deposit
    if (depositToken === ETHER_ADDRESS && user === account){
      walletBalance = await web3.eth.getBalance(account)
      dispatch(exchangeEtherBalanceLoaded(exchangeBalance))
      dispatch(etherBalanceLoaded(walletBalance))
      dispatch(ethBalancesLoaded())
    }

    //Token Deposit
    if (depositToken === Token.networks[networkId].address && user === account){
      walletBalance = await token.methods.balanceOf(account).call()
      dispatch(exchangeTokenBalanceLoaded(exchangeBalance)) 
      dispatch(tokenBalanceLoaded(walletBalance)) 
      dispatch(tokenBalancesLoaded())
    }
  })

  exchange.events.Withdraw({}, async (error, event) => {
    user = event.returnValues.user //user account
    withdrawToken = event.returnValues.token //address of token
    exchangeBalance = event.returnValues.balance //balance of user on the exchange

    //Eth withdraw
    if (withdrawToken === ETHER_ADDRESS && user === account){
      walletBalance = await web3.eth.getBalance(account)
      dispatch(exchangeEtherBalanceLoaded(exchangeBalance))
      dispatch(etherBalanceLoaded(walletBalance))
      dispatch(ethBalancesLoaded())
    }

    //Token withdraw
    if (withdrawToken === Token.networks[networkId].address && user === account){
      walletBalance = await token.methods.balanceOf(account).call()
      dispatch(exchangeTokenBalanceLoaded(exchangeBalance)) 
      dispatch(tokenBalanceLoaded(walletBalance)) 
      dispatch(tokenBalancesLoaded())
    }
  })

  exchange.events.Order({}, (error, event) => {
    dispatch(orderMade(event.returnValues))
  })

}

export const fillOrder = (dispatch, exchange, order, account) => {
  exchange.methods.fillOrder(order.id).send({ from: account })
  .on('transactionHash', (Hash) => {
    dispatch(orderFilling())
  })
  .on('error', (error) => {
    console.log(error)
    if (error.code !== 4001){
      window.alert(`There was an error!`)
    }
  })
}


export const loadBalances = async (dispatch, web3, exchange, token, account) => {
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
  // Trigger all balances loaded (balanceLoadingSelector's starts as true)
  dispatch(ethBalancesLoaded())
  dispatch(tokenBalancesLoaded())
}

export const depositEther = (dispatch, exchange, web3, amount, account) => {
  //we need to convert value to wei
  exchange.methods.depositEther().send({ from: account,  value: web3.utils.toWei(amount, 'ether') })
  .on('transactionHash', (hash) => {
    dispatch(ethBalancesLoading())
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
    dispatch(ethBalancesLoading())
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
      dispatch(tokenBalancesLoading())
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
    dispatch(tokenBalancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    //4001 error -> reject button on metamask confirmation
    if (error.code !== 4001){
      window.alert(`There was an error!`)
    }
  })
}

//BuyOrder: buying token, selling eth
export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
  const tokenGet = token.options.address
  const amountGet = web3.utils.toWei(order.amount, 'ether')//amount of token to purchase
  const tokenGive = ETHER_ADDRESS
  const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

  exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(buyOrderMaking())
  })
  .on('error',(error) => {
    console.error(error)
    if (error.code !== 4001){
      window.alert(`There was an error!`)
    }
  })
}

export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
  const tokenGet = ETHER_ADDRESS
  const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether')
  const tokenGive = token.options.address
  const amountGive = web3.utils.toWei(order.amount, 'ether')

  exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(sellOrderMaking())
  })
  .on('error',(error) => {
    console.error(error)
    if (error.code !== 4001){
      window.alert(`There was an error!`)
    }
  })
}