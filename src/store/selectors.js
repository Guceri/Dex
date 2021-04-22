import { get, isElement } from 'lodash'
import moment from 'moment'
import { createSelector } from 'reselect'
import { iETH, tokens, ether, RED, GREEN } from './helpers'

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e=> e)

export const contractsLoadedSelector = createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl, el) => (tl && el)
)

const filledOrdersLoaded = state => get(state, "exchange.filledOrders.loaded", false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const  filledOrdersSelector = createSelector(
    filledOrders,
    (orders) => {
        //sort by ascending for price comparison in decorateFilledOrders
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)
        orders = decorateFilledOrders(orders)
        //sort orders by date descending
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)
        console.log(orders)
        return orders
    }
)

const decorateFilledOrders = (orders) => {
    let previousOrder = orders[0]
    return(
        orders.map((order) => {
            order = decorateOrder(order) //format price and time
            order = decoratedFilledOrder(order, previousOrder)//color filled orders Green or Red
            previousOrder = order
            return order
        })
    )
}

const decorateOrder = (order) => {
    let etherAmount
    let tokenAmount

    if (order.tokenGive == iETH){
        etherAmount = order.amountGive
        tokenAmount = order.amountGet
    }else{
        etherAmount = order.amountGet
        tokenAmount = order.amountGive
    }

    const precision = 100000
    let tokenPrice = (etherAmount / tokenAmount)
    tokenPrice = Math.round(tokenPrice * precision) / precision

    return({
        ...order,
        etherAmount: ether(etherAmount),
        tokenAmount: tokens(tokenAmount),
        tokenPrice: tokenPrice,
        formattedTimeStamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
    })
}


const decoratedFilledOrder = (order, previousOrder) => {
    return({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    //show green price if only one order exists
    if (previousOrder.id === orderId) {
        return GREEN
    }
    if (previousOrder.tokenPrice <= tokenPrice) {
        return GREEN //success
    } else {
        return RED //danger
    }

}