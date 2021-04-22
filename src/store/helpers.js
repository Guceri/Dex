export const iETH = '0x0000000000000000000000000000000000000000'
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