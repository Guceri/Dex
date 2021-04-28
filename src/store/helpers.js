//TODO - merge helper files
export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
export const RED = 'danger'
export const GREEN = 'success'

export const DECIMALS = (10**18)

export const ether = (wei) => {
	if(wei){
    return(wei / DECIMALS)
  }
}

//same as ether
export const tokens = ether

export const formatBalance = (balance) => {
  balance = ether(balance)
  balance = Math.round(balance * 100) / 100 //use 2 decimal places
  return balance
}