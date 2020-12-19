import { Create, Exercise, Expire, SetImpliedVolRateCall } from '../types/HegicWBTCOptions/HegicOptions'
import { Asset, HegicOption, ImpliedVolatily } from '../types/schema'
import { HegicOptions as Contract } from '../types/HegicWBTCOptions/HegicOptions'
import { Address } from '@graphprotocol/graph-ts';
import { BigIntOne, BigIntZero, getCreateWBTCPool, WBTC_OPTIONS_ADDR } from "../utils";

export function handleCreate(event: Create): void {
  let wbtcOptions = Contract.bind(Address.fromString(WBTC_OPTIONS_ADDR));
  let liquidity_pool = getCreateWBTCPool()

  // Create option
  let option = new HegicOption("WBTC-" + event.params.id.toString());
  option.underlying = liquidity_pool.underlying;
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
    liquidity_pool.totalPutVolume = liquidity_pool.totalPutVolume + option.premium
  } else if (option_data.value7 == 2) {
    option.type = "Call";
    liquidity_pool.totalCallVolume = liquidity_pool.totalCallVolume + option.premium
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
  
  liquidity_pool.totalSettlementFees = liquidity_pool.totalSettlementFees + option.settlementFee;
  liquidity_pool.totalFees = liquidity_pool.totalFees + event.params.totalFee;

  liquidity_pool.save()

  option.save()
};

export function handleExercise(event: Exercise): void {
  let liquidity_pool = getCreateWBTCPool()
  liquidity_pool.numExercisedOptions = liquidity_pool.numExercisedOptions + BigIntOne

  let option = HegicOption.load("WBTC-" + event.params.id.toString())
  if (option == null) {
    return
  }

  option.state = "Exercised"
  option.save()
}

export function handleExpire(event: Expire): void {
  let liquidity_pool = getCreateWBTCPool()
  liquidity_pool.numExpiredOptions = liquidity_pool.numExpiredOptions + BigIntOne

  let option = HegicOption.load("WBTC-" + event.params.id.toString())
  if (option == null) {
    return
  }

  option.state = "Expired"
  option.save()
}

export function handleSetImpliedVolRate(call: SetImpliedVolRateCall): void {
  let liquidity_pool = getCreateWBTCPool()
  liquidity_pool.numImpliedVolatility = liquidity_pool.numImpliedVolatility + BigIntOne

  let iv = new ImpliedVolatily("WBTC-" + liquidity_pool.numImpliedVolatility.toString())
  iv.blockNumber = call.block.number
  iv.timestamp = call.block.timestamp
  iv.impliedVolatility = call.inputs.value
  iv.save()

  let ivs = liquidity_pool.impliedVolatility
  ivs.push(iv.id)
  liquidity_pool.impliedVolatility = ivs
  liquidity_pool.latestImpliedVolatility = iv.id
  liquidity_pool.save()
}