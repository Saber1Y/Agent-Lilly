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

const AAVE_CHAIN_IDS: { [key: string]: number } = {
  ethereum: 1,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  avalanche: 43114,
  base: 8453,
  bsc: 56,
};

const SOLANA_CHAIN_ID = 1151111081099710;

async function fetchSolanaYield(): Promise<YieldData | null> {
  try {
    const response = await fetch('https://api.kamino.finance/v2/lending/markets');
    const data = await response.json();
    
    const usdMarket = data.markets?.find((m: any) => m.symbol === 'USDC');
    if (usdMarket) {
      return {
        chainId: SOLANA_CHAIN_ID,
        chainName: 'Solana',
        symbol: 'USDC',
        supplyApr: parseFloat(usdMarket.supplyYield || '0') * 100,
        liquidity: parseFloat(usdMarket.totalDepositsUsd || '0'),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching Solana yield:', error);
    return null;
  }
}

export async function fetchYields(): Promise<ChainYieldMap> {
  const yields: ChainYieldMap = {};
  
  try {
    const response = await fetch('https://api.aavescan.com/v2/latest');
    if (response.ok) {
      const data = await response.json();
      
      for (const [chainKey, chainId] of Object.entries(AAVE_CHAIN_IDS)) {
        const marketData = data[chainKey];
        if (marketData?.reserves?.USDC) {
          const usdcData = marketData.reserves.USDC;
          yields[chainId] = {
            chainId,
            chainName: chainKey.charAt(0).toUpperCase() + chainKey.slice(1),
            symbol: 'USDC',
            supplyApr: parseFloat(usdcData.supplyApr || '0') * 100,
            liquidity: parseFloat(usdcData.totalLiquidityUSD || '0'),
          };
        }
      }
    }
  } catch (error) {
    console.error('Error fetching Aave yields:', error);
  }
  
  try {
    const solanaYield = await fetchSolanaYield();
    if (solanaYield) {
      yields[SOLANA_CHAIN_ID] = solanaYield;
    }
  } catch (error) {
    console.error('Error fetching Solana yield:', error);
  }
  
  return yields;
}

export function findBestYield(yields: ChainYieldMap, currentChainId: number): {
  shouldRebalance: boolean;
  fromChain: number;
  toChain: number;
  fromYield: number;
  toYield: number;
  difference: number;
} | null {
  const currentYield = yields[currentChainId];
  if (!currentYield) return null;
  
  let bestChain: YieldData | null = null;
  
  for (const [chainId, yieldData] of Object.entries(yields)) {
    const id = parseInt(chainId);
    if (id !== currentChainId && yieldData.liquidity > 1000000) {
      if (!bestChain || yieldData.supplyApr > bestChain.supplyApr) {
        bestChain = yieldData;
      }
    }
  }
  
  if (!bestChain || bestChain.supplyApr <= currentYield.supplyApr) {
    return null;
  }
  
  return {
    shouldRebalance: true,
    fromChain: currentChainId,
    toChain: bestChain.chainId,
    fromYield: currentYield.supplyApr,
    toYield: bestChain.supplyApr,
    difference: bestChain.supplyApr - currentYield.supplyApr,
  };
}
