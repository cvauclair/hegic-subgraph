import { Create, Exercise, Expire } from '../types/HegicETHOptions/HegicOptions'
import { Asset, HegicOption, LiquidityPool } from '../types/schema'
import { HegicOptions as Contract } from '../types/HegicETHOptions/HegicOptions'
import { Address } from '@graphprotocol/graph-ts';
import { BigIntOne, BigIntZero } from "../utils";

let ETH_OPTIONS = "0xefc0eeadc1132a12c9487d800112693bf49ecfa2";
let ETH_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export function handleCreate(event: Create): void {
  let ethOptions = Contract.bind(Address.fromString(ETH_OPTIONS));

  // Check if underlying asset exists
  let underlying = Asset.load(ETH_ADDR);
  if (underlying == null) {
    underlying = new Asset(ETH_ADDR);
    underlying.symbol = "ETH";
    underlying.name = "Ether";
    underlying.decimals = 18;
    underlying.impliedVolatility = ethOptions.impliedVolRate();
    underlying.save()
  }

  // Check if pool exists
  let pool_addr = ethOptions.pool().toHexString().toString();
  let liquidity_pool = LiquidityPool.load(pool_addr)
  if (liquidity_pool == null) {
    liquidity_pool = new LiquidityPool(pool_addr)
    liquidity_pool.underlying = underlying.id;
    liquidity_pool.numOptions = BigIntZero;
    liquidity_pool.options = [];

    liquidity_pool.numProvides = BigIntZero;
    liquidity_pool.provides = [];
    liquidity_pool.numWithdraws = BigIntZero;
    liquidity_pool.withdraws = [];
    liquidity_pool.numProfits = BigIntZero;
    liquidity_pool.profits = [];
    liquidity_pool.numLosses = BigIntZero;
    liquidity_pool.losses = [];
  }

  // Create option
  let option = new HegicOption("ETH-" + event.params.id.toString());

  option.underlying = underlying.id;
  option.creationBlock = event.block.number;
  option.creationTimestamp = event.block.timestamp;
  option.holder = event.params.account.toHexString().toString();
  option.premium = event.params.totalFee - event.params.settlementFee;
  option.settlementFee = event.params.settlementFee;
  
  // Get from state 
  let option_data = ethOptions.options(event.params.id)
  
  option.strike = option_data.value2;
  option.amount = option_data.value4;
  option.expiration = option_data.value6;

  if (option_data.value7 == 1) {
    option.type = "Put";
  } else if (option_data.value7 == 2) {
    option.type = "Call";
  } else {
    return
  }

  if (option_data.value0 == 0) {
    option.type = "Inactive";
  } else if (option_data.value0 == 1) {
    option.type = "Active";
  } else if (option_data.value0 == 2) {
    option.type = "Exercised";
  } else if (option_data.value0 == 3) {
    option.type = "Expired";
  } else {
    return
  }

  // Save entities
  liquidity_pool.numOptions = liquidity_pool.numOptions + BigIntOne;
  let options = liquidity_pool.options;
  options.push(option.id);
  liquidity_pool.options = options;
  liquidity_pool.save()

  option.save()
};

export function handleExercise(event: Exercise): void {

}

export function handleExpire(event: Expire): void {
  
}