import React, { Component } from 'react'
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux'

class MetaMask extends Component {
  render() {
    return (
      <Button 
        variant="primary "
        onClick={(event) => {
        window.ethereum.request({ method: 'eth_requestAccounts' });
        }}
        >
        Connect to MetaMask
      </Button>
    )
  }
}

function mapStateToProps(state) {
  return {

  }
}

export default connect(mapStateToProps)(MetaMask)

