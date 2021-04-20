export const iETH = '0x0000000000000000000000000000000000000000'
//this is the error when a require is not met within a function
export const EVM_REVERT = 'VM Exception while processing transaction: revert'

export const ether = (n) => {
	return new web3.utils.BN(
		web3.utils.toWei(n.toString(), 'ether')
	)
}

//same as ether
export const tokens = (n) => ether(n)
