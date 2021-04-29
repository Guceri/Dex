import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  orderBookSelector,
  orderBookLoadedSelector,
  exchangeSelector,
  accountSelector,
  orderFillingSelector
} from '../store/selectors'
import { fillOrder } from '../store/interactions'


//TODO - Center orderbook
//TODO - orderbook should only have size" and Price
//TODO - calculate the spread for the center divider
//TODO - get rid of pop up when rejecting order form metmask

const renderOrder = (order, props) => {
  const { dispatch, exchange, account } = props

  return(
    <OverlayTrigger
      key={order.id}
      placement='auto'
      overlay={
        <Tooltip id={order.id}>
          {`Click here to ${order.orderFillAction}`}
        </Tooltip>
      }
    >
      <tr
        key={order.id}
        className="order-book-order"
        onClick={(e) => fillOrder(dispatch, exchange, order, account)}
      >
        <td>{order.tokenAmount}</td>
        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
      </tr>
    </OverlayTrigger>
  )
}

const iOrderBook = (props) => {
  return(
    <tbody>
      {props.orderBook.sellOrders.map((order) => renderOrder(order, props))}
      <tr>
        <th>LINK</th>
        <th>LINK/ETH</th>
      </tr>
      {props.orderBook.buyOrders.map((order) => renderOrder(order, props))}
    </tbody>
  )
}
//TODO - difference between 'extends Component' & regular function
class OrderBook extends Component {
  render() {
    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header text-center">
            Order Book
          </div>
          <div className="card-body order-book">
            <table className="table table-dark table-sm small text-center">
              { this.props.showOrderBook ? iOrderBook(this.props) : <Spinner type='table' /> }
            </table>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const orderBookLoaded = orderBookLoadedSelector(state)
  const orderFilling = orderFillingSelector(state)

  return {
    orderBook: orderBookSelector(state),
    showOrderBook: orderBookLoaded && !orderFilling,  //bool
    exchange: exchangeSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(OrderBook);
