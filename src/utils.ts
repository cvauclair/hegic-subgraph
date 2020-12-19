import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Asset, ImpliedVolatily, LiquidityPool } from './types/schema'
import { HegicOptions as Contract } from './types/HegicWBTCOptions/HegicOptions'

export const BigIntZero =  BigInt.fromI32(0)
export const BigIntOne =  BigInt.fromI32(1)
export const BigDecimalZero = BigDecimal.fromString('0')
export const BigDecimalOne = BigDecimal.fromString('1')

export const WBTC_OPTIONS_ADDR = "0x3961245db602ed7c03eeccda33ea3846bd8723bd";
export const WBTC_POOL_ADDR = "0x20dd9e22d22dd0a6ef74a520cb08303b5fad5de7"
export const WBTC_ADDR = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

export function initLiquidityPool(address: string, options_addr: string, underlying: Asset): LiquidityPool {
  // Create pool
  let liquidity_pool = new LiquidityPool(address)
  liquidity_pool.underlying = underlying.id;
  liquidity_pool.numOptions = BigIntZero;
  liquidity_pool.numExercisedOptions = BigIntZero;
  liquidity_pool.numExpiredOptions = BigIntZero;
  liquidity_pool.options = [];

  liquidity_pool.numProvides = BigIntZero;
  liquidity_pool.provides = [];
  liquidity_pool.numWithdraws = BigIntZero;
  liquidity_pool.withdraws = [];
  liquidity_pool.liquidity = BigIntZero;

  liquidity_pool.numProfits = BigIntZero;
  liquidity_pool.profits = [];
  liquidity_pool.totalProfits = BigIntZero;

  liquidity_pool.numLosses = BigIntZero;
  liquidity_pool.losses = [];
  liquidity_pool.totalLosses = BigIntZero;

  liquidity_pool.totalSettlementFees = BigIntZero;
  liquidity_pool.totalFees = BigIntZero;
  liquidity_pool.totalPutVolume = BigIntZero;
  liquidity_pool.totalCallVolume = BigIntZero;

  liquidity_pool.numImpliedVolatility = BigIntZero
  liquidity_pool.impliedVolatility = []
  // let contract = Contract.bind(Address.fromString(options_addr));
  // let iv = new ImpliedVolatily(underlying.symbol + "-" + liquidity_pool.numImpliedVolatility.toString())
  // iv.blockNumber = BigInt.fromI32(11029620)
  // iv.timestamp = BigInt.fromI32(1602315209)
  // iv.impliedVolatility = contract.impliedVolRate()
  // iv.save()

  // liquidity_pool.numImpliedVolatility = BigIntOne
  // liquidity_pool.impliedVolatility = [iv.id]
  // liquidity_pool.latestImpliedVolatility = iv.id
  liquidity_pool.save()

  return liquidity_pool
}

export function getCreateWBTCPool(): LiquidityPool {
  let wbtcOptions = Contract.bind(Address.fromString(WBTC_OPTIONS_ADDR));

  // Check if pool exists
  let pool_addr = wbtcOptions.pool().toHexString().toString();
  let liquidity_pool = LiquidityPool.load(pool_addr)
  if (liquidity_pool == null) {
    // Check if underlying asset exists
    let underlying = Asset.load(WBTC_ADDR);
    if (underlying == null) {
      underlying = new Asset(WBTC_ADDR);
      underlying.symbol = "WBTC";
      underlying.name = "Wrapped BTC";
      underlying.decimals = 8;
      underlying.save()
    }

    // Create pool
    liquidity_pool = initLiquidityPool(pool_addr, WBTC_OPTIONS_ADDR, underlying as Asset)
  }

  return liquidity_pool as LiquidityPool
}

export const ETH_OPTIONS_ADDR = "0xefc0eeadc1132a12c9487d800112693bf49ecfa2";
export const ETH_POOL_ADDR = "0x878f15ffc8b894a1ba7647c7176e4c01f74e140b"
export const ETH_ADDR = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export function getCreateETHPool(): LiquidityPool {
  let ethOptions = Contract.bind(Address.fromString(ETH_OPTIONS_ADDR));

  // Check if pool exists
  let pool_addr = ethOptions.pool().toHexString().toString();
  let liquidity_pool = LiquidityPool.load(pool_addr)
  if (liquidity_pool == null) {
    // Check if underlying asset exists
    let underlying = Asset.load(ETH_ADDR);
    if (underlying == null) {
      underlying = new Asset(ETH_ADDR);
      underlying.symbol = "ETH";
      underlying.name = "Ether";
      underlying.decimals = 18;
      underlying.save()
    }

    // Create pool
    liquidity_pool = initLiquidityPool(pool_addr, ETH_OPTIONS_ADDR, underlying as Asset)
  }

  return liquidity_pool as LiquidityPool
}