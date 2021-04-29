import React, { Component } from 'react'
import { connect } from 'react-redux'
import { exchangeSelector} from '../store/selectors'
import { loadAllOrders} from '../store/interactions'
import OrderBook from './OrderBook'
import Trades from './Trades'
import MyTransactions from './MyTransactions'
import PriceChart from './PriceChart'
import Balance from './Balance'
import NewOrder from './NewOrder'

class Content extends Component {
  UNSAFE_componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    await loadAllOrders(this.props.exchange, this.props.dispatch)
  }

  render() {
    return (
      <div className="content">
        <div className="vertical-split">
          <Balance />
          <NewOrder />
        </div>
        <OrderBook />
        <div className="vertical-split">
          <PriceChart />
          <MyTransactions />
        </div>
        <Trades />
      </div>
    )
  }
}
  

function mapStateToProps(state) {
  return {
    exchange: exchangeSelector(state)
  }
}

export default connect(mapStateToProps)(Content)
