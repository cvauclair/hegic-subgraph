import { 
  Loss as LossEvent, 
  Profit as ProfitEvent, 
  Provide as ProvideEvent, 
  Withdraw as WithdrawEvent
} from "../types/WBTCLiquidityPool/LiquidityPool";
import { 
  Provide,
  Withdraw,
  Profit,
  Loss
} from "../types/schema"
import { BigIntOne, getCreateWBTCPool } from "../utils";

export function handleProvide(event: ProvideEvent): void {
  let liquidity_pool = getCreateWBTCPool();

  let provide = new Provide(liquidity_pool.id + "-" + liquidity_pool.numProvides.toString());
  provide.blockNumber = event.block.number
  provide.timestamp = event.block.timestamp
  provide.account = event.params.account.toHexString().toString()
  provide.amount = event.params.amount
  provide.numWriteTokens = event.params.writeAmount
  provide.save()

  let provides = liquidity_pool.provides;
  provides.push(provide.id);
  liquidity_pool.provides = provides;

  liquidity_pool.numProvides = liquidity_pool.numProvides + BigIntOne;
  liquidity_pool.latestProvide = provide.id
  liquidity_pool.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  let liquidity_pool = getCreateWBTCPool();

  let withdraw = new Withdraw(liquidity_pool.id + "-" + liquidity_pool.numWithdraws.toString());
  withdraw.blockNumber = event.block.number
  withdraw.timestamp = event.block.timestamp
  withdraw.account = event.params.account.toHexString().toString()
  withdraw.amount = event.params.amount
  withdraw.numWriteTokens = event.params.writeAmount
  withdraw.save()

  let withdraws = liquidity_pool.withdraws;
  withdraws.push(withdraw.id);
  liquidity_pool.withdraws = withdraws;

  liquidity_pool.numWithdraws = liquidity_pool.numWithdraws + BigIntOne;
  liquidity_pool.latestWithdraw = withdraw.id
  liquidity_pool.save()
}

export function handleProfit(event: ProfitEvent): void {
  let liquidity_pool = getCreateWBTCPool();

  let profit = new Profit(liquidity_pool.id + "-" + liquidity_pool.numProfits.toString())
  profit.blockNumber = event.block.number
  profit.timestamp = event.block.timestamp
  profit.amount = event.params.amount
  profit.option = "WBTC-" + event.params.id.toString()
  profit.save()

  let profits = liquidity_pool.profits;
  profits.push(profit.id);
  liquidity_pool.profits = profits;

  liquidity_pool.numProfits = liquidity_pool.numProfits + BigIntOne;
  liquidity_pool.latestProfit = profit.id
  liquidity_pool.save()
}

export function handleLoss(event: LossEvent): void {
  let liquidity_pool = getCreateWBTCPool();

  let loss = new Loss(liquidity_pool.id + "-" + liquidity_pool.numLosses.toString())
  loss.blockNumber = event.block.number
  loss.timestamp = event.block.timestamp
  loss.amount = event.params.amount
  loss.option = "WBTC-" + event.params.id.toString()
  loss.save()

  let losses = liquidity_pool.losses;
  losses.push(loss.id);
  liquidity_pool.losses = losses;

  liquidity_pool.numLosses = liquidity_pool.numLosses + BigIntOne;
  liquidity_pool.latestProfit = loss.id
  liquidity_pool.save()
}