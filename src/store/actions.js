// WEB3
export function web3Loaded(connection) {
  return {
    type: 'WEB3_LOADED',
    connection
  }
}

export function networkLoaded(networkId) {
  return {
    type: 'NETWORK_LOADED',
    networkId
  }
}

export function web3AccountLoaded(account) {
  return {
    type: 'WEB3_ACCOUNT_LOADED',
    account
  }
}

// TOKEN
export function tokenLoaded(contract) {
  return {
    type: 'TOKEN_LOADED',
    contract
  }
}

// EXCHANGE
export function exchangeLoaded(contract) {
  return {
    type: 'EXCHANGE_LOADED',
    contract
  }
}

export function cancelledOrdersLoaded(cancelledOrders) {
  return {
    type: 'CANCELLED_ORDERS_LOADED',
    cancelledOrders
  }
}

export function filledOrdersLoaded(filledOrders) {
  return {
    type: 'FILLED_ORDERS_LOADED',
    filledOrders
  }
}

export function allOrdersLoaded(allOrders) {
  return {
    type: 'ALL_ORDERS_LOADED',
    allOrders
  }
}

export function orderCancelling() {
  return {
    type: 'ORDER_CANCELLING',
  }
}

export function orderCancelled(order) {
  return {
    type: 'ORDER_CANCELLED',
    order: order
  }
}

export function orderFilling() {
  return {
    type: 'ORDER_FILLING',
  }
}

export function orderFilled(order) {
  return {
    type: 'ORDER_FILLED',
    order: order
  }
}
//=====================================================================================================
//Deposit/Withdraw Event
//loadBalances()
export function etherBalanceLoaded(balance) {
  return {
    type: 'ETHER_BALANCE_LOADED',
    balance
  }
}
//Deposit/Withdraw Event
//loadBalances()
export function tokenBalanceLoaded(balance) {
  return {
    type: 'TOKEN_BALANCE_LOADED',
    balance
  }
}
//Deposit/Withdraw Event
//loadBalances()
export function exchangeEtherBalanceLoaded(balance) {
  return {
    type: 'EXCHANGE_ETHER_BALANCE_LOADED',
    balance
  }
}
//Deposit/Withdraw Event
//loadBalances()
export function exchangeTokenBalanceLoaded(balance) {
  return {
    type: 'EXCHANGE_TOKEN_BALANCE_LOADED',
    balance
  }
}

//=====================================================================================================

export function ethBalancesLoaded() {
  return {
    type: 'ETH_BALANCES_LOADED'
  }
}
export function ethBalancesLoading() {
  return {
    type: 'ETH_BALANCES_LOADING'
  }
}
export function tokenBalancesLoaded() {
  return {
    type: 'TOKEN_BALANCES_LOADED'
  }
}
export function tokenBalancesLoading() {
  return {
    type: 'TOKEN_BALANCES_LOADING'
  }
}

//=====================================================================================================

//onChange Balance deposit form 
export function etherDepositAmountChanged(amount) {
  return {
    type: 'ETHER_DEPOSIT_AMOUNT_CHANGED',
    amount
  }
}
//onChange Balance withdraw form 
export function etherWithdrawAmountChanged(amount) {
  return {
    type: 'ETHER_WITHDRAW_AMOUNT_CHANGED',
    amount
  }
}
//onChange Balance deposit form 
export function tokenDepositAmountChanged(amount) {
  return {
    type: 'TOKEN_DEPOSIT_AMOUNT_CHANGED',
    amount
  }
}
//onChange Balance withdraw form 
export function tokenWithdrawAmountChanged(amount) {
  return {
    type: 'TOKEN_WITHDRAW_AMOUNT_CHANGED',
    amount
  }
}
//=====================================================================================================
// Track buy order amount field
export function buyOrderAmountChanged(amount) {
  return {
    type: 'BUY_ORDER_AMOUNT_CHANGED',
    amount
  }
}
//track buy order price field
export function buyOrderPriceChanged(price) {
  return {
    type: 'BUY_ORDER_PRICE_CHANGED',
    price
  }
}
//track processing of buy order
export function buyOrderMaking(price) {
  return {
    type: 'BUY_ORDER_MAKING'
  }
}

// Event subscribes to this action (order is made event)
export function orderMade(order) {
  return {
    type: 'ORDER_MADE',
    order
  }
}

// Sell Order
export function sellOrderAmountChanged(amount) {
  return {
    type: 'SELL_ORDER_AMOUNT_CHANGED',
    amount
  }
}

export function sellOrderPriceChanged(price) {
  return {
    type: 'SELL_ORDER_PRICE_CHANGED',
    price
  }
}

export function sellOrderMaking(price) {
  return {
    type: 'SELL_ORDER_MAKING'
  }
}



















