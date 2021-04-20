//this import works because of the babel config in truffle-config file and the .babelrc file
import { tokens, EVM_REVERT, iETH, ether} from './helpers'
const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
	let token
	let exchange
	const feePercent = 10

	beforeEach(async () => {
		//Deploy token
		token = await Token.new()
		//Transfer some tokens to user1
		token.transfer(user1, tokens(100), {from: deployer})
		//Deploy exhange
		exchange = await Exchange.new(feeAccount, feePercent)
	})

	describe('deployment', () => {
		it('tracks the fee account', async () => {
			const result = await exchange.feeAccount()
			result.should.equal(feeAccount)
		})

		it('tracks the fee percent', async () => {
			const result = await exchange.feePercent()
			result.toString().should.equal(feePercent.toString())
		})
	})

	describe('fallback', () => {
		it('reverts when Ether is sent', async () => {
			await exchange.sendTransaction({value: ether(1), from: user1}).should.be.rejectedWith(EVM_REVERT)
		})
	})

	describe('depositing Ether', () => {
		let result
		let amount = ether(1)

		beforeEach(async () => {
			result = await exchange.depositEther({from: user1, value: amount})
		})

		it('tracks the Ether deposit', async () => {
			const balance = await exchange.tokens(iETH, user1)
			balance.toString().should.equal(amount.toString())
		})

		it('emits a Deposit event', async () => {
			const log = result.logs[0]
			log.event.should.equal('Deposit')
			const event = log.args
			event.token.should.equal(iETH, 'ETH address is correct')
			event.user.should.equal(user1, 'user is correct')
			event.amount.toString().should.equal(amount.toString(), 'amount is correct')
			event.balance.toString().should.equal(amount.toString(), 'balance is correct')
		})

	})

	describe('withdrawing Ether', () => {
		let result
		let amount

		beforeEach(async () => {
			amount = ether(1)
			//deposit ether first
			await exchange.depositEther({from: user1, value: amount})
		})

		describe('success', () => {

			beforeEach(async () => {
				//withdraw ether
				result = await exchange.withdrawEther(amount, {from: user1})
			})

			it('withdraws Ether funds', async () => {
				const balance = await exchange.tokens(iETH, user1)
				balance.toString().should.equal('0')
			})

			it('emits a Withdraw event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Withdraw')
				const event = log.args
				event.token.should.equal(iETH, 'ETH address is correct')
				event.user.should.equal(user1, 'user is correct')
				event.amount.toString().should.equal(amount.toString(), 'amount is correct')
				event.balance.toString().should.equal('0', 'balance is correct')
			})

		})

		describe('failure', () => {

			it('rejects withdraw for insufficient funds', async () => {
				await exchange.withdrawEther(ether(2), {from: user1}).should.be.rejectedWith(EVM_REVERT)
			})

		})
	})

	describe('depositing tokens', () => {
		let result
		let amount

		describe('success', () => {

			beforeEach(async () => {
				amount = tokens(10)
				await token.approve(exchange.address, amount, { from: user1})
				result = await exchange.depositToken(token.address, amount, { from: user1})
			})

			it('tracks the token deposit', async () => {
				//check exchange token balance
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString())
				//check balance of user1
				balance = await exchange.tokens(token.address, user1)
				balance.toString().should.equal(amount.toString())
			})

			it('emits a Deposit event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Deposit')
				const event = log.args
				event.token.should.equal(token.address, 'token address is correct')
				event.user.should.equal(user1, 'user is correct')
				event.amount.toString().should.equal(amount.toString(), 'amount is correct')
				event.balance.toString().should.equal(amount.toString(), 'balance is correct')
			})

		})

		describe('failure', () => {

			it('rejects Ether deposits', async () => {
				await exchange.depositToken(iETH, ether(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
			})

			it('fails when no tokens are approved', async () => {
				//Don't approve tokens before depositing
				await exchange.depositToken(token.address, amount, { from: user1}).should.be.rejectedWith(EVM_REVERT)
			})

		})
	})

	describe('withdrawing tokens', () => {
		let result
		let amount


		describe('success', () => {

			beforeEach(async () => {
				amount = tokens(10)
				await token.approve(exchange.address, amount, { from: user1})
				await exchange.depositToken(token.address, amount, { from: user1})
				result = await exchange.withdrawToken(token.address, amount, { from: user1})
			})

			it('withdraws tokens funds', async () => {
				const balance = await exchange.tokens(token.address, user1)
				balance.toString().should.equal('0')
			})

			it('emits a Withdraw event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Withdraw')
				const event = log.args
				event.token.should.equal(token.address, 'Token address is correct')
				event.user.should.equal(user1, 'user is correct')
				event.amount.toString().should.equal(amount.toString(), 'amount is correct')
				event.balance.toString().should.equal('0', 'balance is correct')
			})

		})

		describe('failure', () => {

			it('rejects Ether withdraws', async () => {
				await exchange.withdrawToken(iETH, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects withdraw for insufficient funds', async () => {
				await exchange.withdrawToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
			})
		})

	})

	describe('checking balances', () => {
		let amount 

		beforeEach(async () => {
			amount = ether(1)
			exchange.depositEther({ from: user1, value: amount })
		})

		it('returns user balance', async () => {
			const result = await exchange.balanceOf(iETH, user1)
			result.toString().should.equal(amount.toString())
		})

	})

	describe('making orders', () => {
		let result

		beforeEach(async () => {
			result = await exchange.makeOrder(token.address, tokens(1), iETH, ether(1), { from: user1 })
		})

		it('tracks the newly created order', async () => {
			const orderCount = await exchange.orderCount()
			orderCount.toString().should.equal('1')
			const order = await exchange.orders('1')
			order.id.toString().should.equal('1', 'id is correct')
			order.user.should.equal(user1, 'user is correct')
			order.tokenGet.should.equal(token.address, 'tokenGet is correct')
			order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
			order.tokenGive.should.equal(iETH, 'tokenGive is correct')
			order.amountGive.toString().should.equal(ether(1).toString(), "amoungGive is correct")
			order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
		})


		it('emits on "Order" event', async () => {
			const log = result.logs[0]
			log.event.should.equal('Order')
			const event = log.args
			event.id.toString().should.equal('1', 'id is correct')
			event.user.should.equal(user1, 'user is correct')
			event.tokenGet.should.equal(token.address, 'tokenGet is correct')
			event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
			event.tokenGive.should.equal(iETH, 'tokenGive is correct')
			event.amountGive.toString().should.equal(ether(1).toString(), "amoungGive is correct")
			event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')			
		})
	})

	describe('order actions', () => {
		
		beforeEach(async () => {
			//user1 deposits  1 ether on exchange
			await exchange.depositEther({ from: user1, value: ether(1)})
			//give user2 100 tokens
			await token.transfer(user2, tokens(100), { from: deployer })
			//user2 deposit 2 tokens on exchange
			await token.approve(exchange.address, tokens(2), { from: user2 })
			await exchange.depositToken(token.address, tokens(2), { from: user2 })
			//user1 posts a limit order on the order book to buy the  1 token for 1 eth
			await exchange.makeOrder(token.address, tokens(1), iETH, ether(1), { from: user1})
		})

		describe('filling orders', async () => {
			let result

			describe('success', async () => {
				beforeEach(async () => {
					//user2 is the market order selling 1 token or orderId 1
					result = await exchange.fillOrder('1', { from: user2 })
				})

				it('post-trade balances & fees', async () => {
					let balance
					//user1 received 1 token
					balance = await exchange.balanceOf(token.address, user1)
					balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens')
					//user2 received 1 eth
					balance = await exchange.balanceOf(iETH, user2)
					balance.toString().should.equal(ether(1).toString(), 'user2 received ether')
					//eth balance of user1 is now zero
					balance = await exchange.balanceOf(iETH, user1)
					balance.toString().should.equal('0', 'user1 eth deducted')
					//token balance of user2 is 1 less 
					balance = await exchange.balanceOf(token.address, user2)
					//token balance should be 2(balance) - 1(trade)-.1(fee) = .9 (new balance)
					balance.toString().should.equal(tokens(.9).toString(), 'user2 tokens deducted wih fee applied')
					const feeAccount = await exchange.feeAccount()
					balance = await exchange.balanceOf(token.address, feeAccount)
					balance.toString().should.equal(tokens(.1).toString(), 'feeAcount received fee')
				})

				it('updates filled orders', async () => {
					const orderFilled = await exchange.orderFilled(1)
					orderFilled.should.equal(true)
				})

				it('emits a "Trade" event', async () => {
					const log = result.logs[0]
					log.event.should.equal('Trade')
					const event = log.args
					event.id.toString().should.equal('1', 'id is correct')
					event.user.should.equal(user1, 'user is correct')
					event.tokenGet.should.equal(token.address, 'tokenGet is correct')
					event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
					event.tokenGive.should.equal(iETH, 'tokenGive is correct')
					event.amountGive.toString().should.equal(ether(1).toString(), "amoungGive is correct")
					event.userFill.should.equal(user2, 'userFill is correct')
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')			
				})

			})

			describe('failure', async () => {
				it('rejects invalid order ids', async () => {
					const invalidOrderid = 99999
					await exchange.fillOrder(invalidOrderid, { from: user2 }).should.be.rejectedWith(EVM_REVERT)
				})

				it('rejects already-filled orders', async () => {
					await exchange.fillOrder('1', { from: user2 }).should.be.fulfilled
					//try to fill it again
					await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
				})

				it('rejects cancelled orders', async () => {
					await exchange.cancelOrder('1', { from: user1 }).should.be.fulfilled
					await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
				})
			})

		})



		describe('cancelling orders', async () => {
			let result

			describe('success', async () => {
				beforeEach(async () => {
					result = await exchange.cancelOrder('1', {from: user1})
				})

				it('updates cancelled orders', async () => {
					const orderCancelled = await exchange.orderCancelled(1)
					orderCancelled.should.equal(true)
				})

				it('emits a "Cancel" event', async () => {
					const log = result.logs[0]
					log.event.should.equal('Cancel')
					const event = log.args
					event.id.toString().should.equal('1', 'id is correct')
					event.user.should.equal(user1, 'user is correct')
					event.tokenGet.should.equal(token.address, 'tokenGet is correct')
					event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
					event.tokenGive.should.equal(iETH, 'tokenGive is correct')
					event.amountGive.toString().should.equal(ether(1).toString(), "amoungGive is correct")
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')			
				})
			})

			describe('failure', async () => {
				it('rejects invalid order ids', async () => {
					const invalidOrderId = 99999
					await exchange.cancelOrder(invalidOrderId, {from: user1}).should.be.rejectedWith(EVM_REVERT)
				})

				it('rejects unauthorized cancelations', async () => {
					await exchange.cancelOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
				})

			})
		})
	})

})