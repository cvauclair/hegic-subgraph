import { Create, Exercise, Expire } from '../types/HegicWBTCOptions/HegicOptions'
import { Asset, HegicOption, LiquidityPool } from '../types/schema'
import { HegicOptions as Contract } from '../types/HegicWBTCOptions/HegicOptions'
import { Address } from '@graphprotocol/graph-ts';
import { BigIntOne, BigIntZero } from "../utils";

let WBTC_OPTIONS = "0x3961245db602ed7c03eeccda33ea3846bd8723bd";
let WBTC_ADDR = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

export function handleCreate(event: Create): void {
  let wbtcOptions = Contract.bind(Address.fromString(WBTC_OPTIONS));

  // Check if underlying asset exists
  let underlying = Asset.load(WBTC_ADDR);
  if (underlying == null) {
    underlying = new Asset(WBTC_ADDR);
    underlying.symbol = "WBTC";
    underlying.name = "Wrapped BTC";
    underlying.decimals = 8;
    underlying.impliedVolatility = wbtcOptions.impliedVolRate();
    underlying.save()
  }

  // Check if pool exists
  let pool_addr = wbtcOptions.pool().toHexString().toString();
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
  let option = new HegicOption("WBTC-" + event.params.id.toString());

  option.underlying = underlying.id;
  option.creationBlock = event.block.number;
  option.creationTimestamp = event.block.timestamp;
  option.holder = event.params.account.toHexString().toString();
  option.premium = event.params.totalFee - event.params.settlementFee;
  option.settlementFee = event.params.settlementFee;
  
  // Get from state 
  let option_data = wbtcOptions.options(event.params.id)
  
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
    option.state = "Inactive";
  } else if (option_data.value0 == 1) {
    option.state = "Active";
  } else if (option_data.value0 == 2) {
    option.state = "Exercised";
  } else if (option_data.value0 == 3) {
    option.state = "Expired";
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
  let option = HegicOption.load("WBTC-" + event.params.id.toString())
  if (option == null) {
    return
  }

  option.state = "Exercised"
  option.save()
}

export function handleExpire(event: Expire): void {
  let option = HegicOption.load("WBTC-" + event.params.id.toString())
  if (option == null) {
    return
  }

  option.state = "Expired"
  option.save()
}