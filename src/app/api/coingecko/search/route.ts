import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    // Search for coins
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    )
    const searchData = await searchResponse.json()

    if (!searchData.coins || searchData.coins.length === 0) {
      return NextResponse.json([])
    }

    // Get price data for the first 10 results
    const coinIds = searchData.coins.slice(0, 10).map((coin: any) => coin.id).join(',')
    const priceResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    )
    const priceData = await priceResponse.json()

    return NextResponse.json(priceData)
  } catch (error) {
    console.error('Error in CoinGecko search:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}