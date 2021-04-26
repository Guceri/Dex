import { combineReducers } from 'redux';

function web3(state = {}, action) {
  switch (action.type) {
    case 'WEB3_LOADED':
      return { ...state,  connection: action.connection }
    case 'WEB3_ACCOUNT_LOADED':
      return { ...state, account: action.account }
    default:
      return state
  }
}

function token(state = {}, action) {
  switch (action.type) {
    case 'TOKEN_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    default:
      return state
  }
}

function exchange(state = {}, action) {
  let index, data 

  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    case 'CANCELLED_ORDERS_LOADED':
      return { ...state, cancelledOrders: { loaded: true, data: action.cancelledOrders } }
    case 'FILLED_ORDERS_LOADED':
      return { ...state, filledOrders: { loaded: true, data: action.filledOrders } }
    case 'ALL_ORDERS_LOADED':
      return { ...state, allOrders: { loaded: true, data: action.allOrders } }
    case 'ORDER_CANCELLING':
      return {...state, orderCancelling: true }
      //TODO - Understand how this works
    case 'ORDER_CANCELLED':
      return{
        ...state,
        orderCancelling: false,
        cancelledOrders: {
          ...state.cancelledOrders,
          data: [
            ...state.cancelledOrders.data,
            action.order
          ]
        }
      }
    case 'ORDER_Filling':
      return {...state, orderFilling: true }
    case 'ORDER_FILLED':
      /*prevent duplicate orders
      check filledOrders to see if order has already been filled 
      it is possible the order can already be filled by someone else (and the Trade event would be read incorrectly)
      findIndex()method returns the index of the first element in the array that satisfies the provided testing function
      pass in the order.id's from state and compare with the order.id submitted and find where it is. */
      //FIXME - there is still an issue of crossed trades events if 2 people trade 2 seperate orders
      index = state.filledOrders.data.findIndex(order => order.id === action.order.id)
      //-1 -> not found
      if (index === -1){
        //add order to filledOrders
        data = [...state.filledOrders.data, action.order]
      }else{
        //don't do anything
        data = state.filledOrders.data
      }

      return{
        ...state,
        orderFilling: false,
        filledOrders: {
          ...state.filledOrders,
          data
        }
      }

    default:
      return state
  }
}

const rootReducer = combineReducers({
  web3,
  token,
  exchange
})

export default rootReducer
