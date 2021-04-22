import React, { Component } from 'react'
import { connect } from 'react-redux' 
import { filledOrdersLoadedSelector, filledOrdersSelector } from '../store/selectors'
import Spinner from './Spinner'

const showFilledOrders = (filledOrders) => {
  return(
    <tbody>
      { filledOrders.map((order) => {
        return (
          <tr className={`order-${order.id}`} key={order.id}>
            <td className="text-muted">{ order.formattedTimeStamp }</td> 
            <td>{order.tokenAmount}</td>
            <td className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
          </tr>
        )
      }) }
    </tbody>
  )
}

class Trades extends Component {
  render() {
    return(
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
              Trades
          </div>
          <div className="card-body">
            <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>DAPP</th>
                    <th>DAPP/ETH</th>
                  </tr>
                </thead>
                { this.props.filledOrdersLoaded ? showFilledOrders(this.props.filledOrders) : <Spinner type="table" /> }
            </table>
          </div>
        </div>
      </div>
    )
  }
}

//this allows us to use dispatch through this.props
function mapStateToProps(state) {
  return{
    filledOrdersLoaded: filledOrdersLoadedSelector(state), //bool
    filledOrders: filledOrdersSelector(state)
  }
}

//connect is what connects  this component to redux
export default connect(mapStateToProps)(Trades);