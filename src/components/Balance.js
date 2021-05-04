import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { Tabs, Tab } from 'react-bootstrap'
import { 
  loadBalances,
  depositEther,
  depositToken,
  withdrawEther,
  withdrawToken
} from '../store/interactions'
import {   
  exchangeSelector,
  tokenSelector,
  accountSelector,
  web3Selector,
  etherBalanceSelector,
  tokenBalanceSelector,
  exchangeEtherBalanceSelector,
  exchangeTokenBalanceSelector,
  ethBalanceLoadingSelector,
  tokenBalanceLoadingSelector,
  etherDepositAmountSelector,
  etherWithdrawAmountSelector,
  tokenDepositAmountSelector,
  tokenWithdrawAmountSelector
} from '../store/selectors'
import { 
  etherDepositAmountChanged, 
  etherWithdrawAmountChanged,
  tokenDepositAmountChanged,
  tokenWithdrawAmountChanged
} from '../store/actions'


const balanceForm = (props) => {
  const { 
    dispatch,
    exchange,
    web3,
    account,
    etherBalance,
    tokenBalance,
    exchangeEtherBalance,
    exchangeTokenBalance,
    etherDepositAmount,
    token,
    tokenDepositAmount,
    etherWithdrawAmount,
    tokenWithdrawAmount,
    ethBalanceLoading,
    tokenBalanceLoading
  } = props

  return (
    <Tabs defaultActiveKey="deposit" className="bg-dark text-white h5" variant ="pill">
      <Tab eventKey="deposit" title="Deposit" className="bg-dark">
        <br></br>
        <table className="table table-dark table-sm small text-center">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th> 
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{!ethBalanceLoading ? etherBalance : <Spinner /> }</td>
              <td>{!ethBalanceLoading ? exchangeEtherBalance : <Spinner /> }</td>
            </tr>
            <tr>
              <td>LINK</td>
              <td>{!tokenBalanceLoading ? tokenBalance : <Spinner /> }</td>
              <td>{!tokenBalanceLoading ? exchangeTokenBalance : <Spinner /> }</td>
            </tr>
          </tbody>
        </table>
        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          depositEther(dispatch, exchange, web3, etherDepositAmount, account)
          event.target.reset()
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
            type="text"
            placeholder="ETH Amount"
            onChange={(e) => dispatch( etherDepositAmountChanged(e.target.value) )}
            className="form-control form-control-sm bg-dark text-white"
            required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
          </div>
        </form>
        <br></br>
        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account)
          event.target.reset()
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
            type="text"
            placeholder="LINK Amount"
            onChange={(e) => dispatch( tokenDepositAmountChanged(e.target.value) )}
            className="form-control form-control-sm bg-dark text-white"
            required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
          </div>
        </form>
      </Tab>
      <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
        <br></br>
        <table className="table table-dark table-sm small text-center">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th> 
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{!ethBalanceLoading ? etherBalance : <Spinner /> }</td>
              <td>{!ethBalanceLoading ? exchangeEtherBalance: <Spinner /> }</td>      
            </tr>
            <tr>
              <td>LINK</td>
              <td>{!tokenBalanceLoading ? tokenBalance : <Spinner /> }</td>
              <td>{!tokenBalanceLoading ? exchangeTokenBalance : <Spinner /> }</td>
            </tr>
          </tbody>
        </table>
        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account)
          event.target.reset()
          }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
            type="text"
            placeholder="ETH Amount"
            onChange={(e) => dispatch( etherWithdrawAmountChanged(e.target.value) )}
            className="form-control form-control-sm bg-dark text-white"
            required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
          </div>
        </form>
        <br></br>
        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account)
          event.target.reset()
          }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
            type="text"
            placeholder="LINK Amount"
            onChange={(e) => dispatch( tokenWithdrawAmountChanged(e.target.value) )}
            className="form-control form-control-sm bg-dark text-white"
            required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
          </div>
        </form>
      </Tab>
    </Tabs>
  )
}

class Balance extends Component {

  UNSAFE_componentWillMount() {
    this.loadBlockchainData(this.props)
  }

  async loadBlockchainData(props) {
    const { dispatch, web3, exchange, token, account } = props
    await loadBalances(dispatch, web3, exchange, token, account)
  }

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header text-center">
          Balance
        </div>
        <div className="card-body">
          { balanceForm(this.props) }
        </div>
      </div>
    )
  }
}
 
function mapStateToProps(state) {
  return {
    account: accountSelector(state),
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    web3: web3Selector(state),
    etherBalance: etherBalanceSelector(state),
    tokenBalance: tokenBalanceSelector(state),
    exchangeEtherBalance: exchangeEtherBalanceSelector(state),
    exchangeTokenBalance: exchangeTokenBalanceSelector(state),

    ethBalanceLoading: ethBalanceLoadingSelector (state),
    tokenBalanceLoading:tokenBalanceLoadingSelector (state),

    etherDepositAmount: etherDepositAmountSelector(state),
    etherWithdrawAmount: etherWithdrawAmountSelector(state),
    tokenDepositAmount: tokenDepositAmountSelector(state),
    tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
  }
}

export default connect(mapStateToProps)(Balance);


