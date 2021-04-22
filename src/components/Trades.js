import React, { Component } from 'react'
import { connect } from 'react-redux' 
import { filledOrdersLoadedSelector, filledOrdersSelector } from '../store/selectors'

class Trades extends Component {
    render() {
        return(
          <div className="card bg-dark text-white">
            <div className="card-header">
                Card Title
            </div>
            <div className="card-body">
              <table className="table table-dark table-sm small">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>DAPP</th>
                      <th>DAPP/ETH</th>
                      <tr>
                        <td></td>   
                        <td></td>
                        <td></td>
                      </tr>
                    </tr>
                  </thead>
              </table>
            </div>
          </div>
        )
    }
}

//this allows us to use dispatch through this.props
function mapStateToProps(state) {
    return{
      filledOrdersLoaded: filledOrdersLoadedSelector(state),
      filledOrders: filledOrdersSelector(state)
    }
}

//connect is what connects  this component to redux
export default connect(mapStateToProps)(Trades);