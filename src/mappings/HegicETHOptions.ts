import { Create, Exercise, Expire } from '../types/HegicETHOptions/HegicOptions'
import { Asset, HegicOption, LiquidityPool } from '../types/schema'
import { HegicOptions as Contract } from '../types/HegicETHOptions/HegicOptions'
import { Address } from '@graphprotocol/graph-ts';
import { BigIntOne, BigIntZero, ETH_OPTIONS_ADDR, getCreateETHPool } from "../utils";

export function handleCreate(event: Create): void {
  let ethOptions = Contract.bind(Address.fromString(ETH_OPTIONS_ADDR));
  let liquidity_pool = getCreateETHPool()

  // Create option
  let option = new HegicOption("ETH-" + event.params.id.toString());

  option.underlying = liquidity_pool.underlying;
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
  let option = HegicOption.load("ETH-" + event.params.id.toString())
  if (option == null) {
    return
  }

  option.state = "Exercised"
  option.save()
}

export function handleExpire(event: Expire): void {
  let option = HegicOption.load("ETH-" + event.params.id.toString())
  if (option == null) {
    return
  }

  option.state = "Expired"
  option.save()
}