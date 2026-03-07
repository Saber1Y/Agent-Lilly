import { fetchAaveYields } from "./aaveDirect";

export interface YieldData {
  chainId: number;
  chainName: string;
  symbol: string;
  supplyApr: number;
  liquidity: number;
}

export interface ChainYieldMap {
  [chainId: number]: YieldData;
}

export interface YieldRecommendation {
  shouldRebalance: boolean;
  fromChain: number;
  toChain: number;
  fromYield: number;
  toYield: number;
  difference: number;
}

export async function fetchYields(): Promise<ChainYieldMap> {
  const yields = await fetchAaveYields();

  return yields.reduce<ChainYieldMap>((accumulator, item) => {
    accumulator[item.chainId] = {
      chainId: item.chainId,
      chainName: item.chainName,
      symbol: "USDC",
      supplyApr: item.supplyRate,
      liquidity: item.liquidity,
    };
    return accumulator;
  }, {});
}

export function findBestYield(
  yields: ChainYieldMap,
  currentChainId: number,
  minimumImprovement = 0.2,
): YieldRecommendation | null {
  const entries = Object.values(yields);
  if (!entries.length) {
    return null;
  }

  const currentYield = yields[currentChainId];
  const bestYield = entries.reduce((best, candidate) =>
    candidate.supplyApr > best.supplyApr ? candidate : best,
  );

  if (!currentYield) {
    return {
      shouldRebalance: true,
      fromChain: currentChainId,
      toChain: bestYield.chainId,
      fromYield: 0,
      toYield: bestYield.supplyApr,
      difference: bestYield.supplyApr,
    };
  }

  const difference = bestYield.supplyApr - currentYield.supplyApr;

  return {
    shouldRebalance: difference > minimumImprovement,
    fromChain: currentChainId,
    toChain: bestYield.chainId,
    fromYield: currentYield.supplyApr,
    toYield: bestYield.supplyApr,
    difference,
  };
}
