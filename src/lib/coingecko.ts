// Using local API routes to avoid CORS issues
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export interface CoinPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_24h: number
  price_change_percentage_24h: number
}

export async function searchCoins(query: string): Promise<CoinPrice[]> {
  try {
    const response = await fetch(`/api/coingecko/search?query=${encodeURIComponent(query)}`)
    const data = await response.json()
    
    if (Array.isArray(data)) {
      return data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        current_price: coin.current_price || 0,
        market_cap: coin.market_cap || 0,
        market_cap_rank: coin.market_cap_rank || 0,
        price_change_24h: coin.price_change_24h || 0,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error searching coins:', error)
    return []
  }
}

export async function getCoinPrice(coinId: string): Promise<number | null> {
  try {
    const response = await fetch(`/api/coingecko/price?coinId=${coinId}`)
    const data = await response.json()
    
    if (data.price) {
      return data.price
    }
    
    return null
  } catch (error) {
    console.error('Error fetching coin price:', error)
    return null
  }
}

export async function getMultipleCoinPrices(coinIds: string[]): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`
    )
    const data = await response.json()
    
    const prices: Record<string, number> = {}
    for (const coinId of coinIds) {
      if (data[coinId] && data[coinId].usd) {
        prices[coinId] = data[coinId].usd
      }
    }
    
    return prices
  } catch (error) {
    console.error('Error fetching multiple coin prices:', error)
    return {}
  }
}

export async function getCoinInfo(coinId: string) {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    )
    const data = await response.json()
    
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      current_price: data.market_data?.current_price?.usd || 0,
      market_cap: data.market_data?.market_cap?.usd || 0,
      price_change_24h: data.market_data?.price_change_24h || 0,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
    }
  } catch (error) {
    console.error('Error fetching coin info:', error)
    return null
  }
}

export async function getHistoricalPrice(coinId: string, date: string): Promise<number | null> {
  try {
    // Convert date to DD-MM-YYYY format required by CoinGecko
    const [year, month, day] = date.split('-')
    const formattedDate = `${day}-${month}-${year}`
    
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${coinId}/history?date=${formattedDate}&localization=false`
    )
    const data = await response.json()
    
    if (data.market_data?.current_price?.usd) {
      return data.market_data.current_price.usd
    }
    
    return null
  } catch (error) {
    console.error('Error fetching historical price:', error)
    return null
  }
}